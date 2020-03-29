import * as cdk from '@aws-cdk/core';
import s3 = require('@aws-cdk/aws-s3');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import codebuild = require('@aws-cdk/aws-codebuild');
import lambda = require('@aws-cdk/aws-lambda');
import kms = require('@aws-cdk/aws-kms');
import iam = require('@aws-cdk/aws-iam');
import params = require('../params.json');

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Parameters
     * Taken from local file `params.json`. Generally is better
     * to take these parameters from ParameterStore or SecretsManager,
     * but I am doing it this way for simplicity.
     */
    const githubToken = new cdk.SecretValue(params["github-oauth-token"]);
    const k8sASGDev = params["k8s-asg-dev"];
    const k8sASGProd = params["k8s-asg-prod"];
    const prodCrossAccountRoleArn = params["cross-account-prod-role-arn"];
    const prodDeployerRoleArn = params["prod-deployer-role-arn"];

    /**
     * Production Roles
     * IAM Roles in the production account, will be needed in the
     * PROD stage of the pipeline.
     */
    const prodDeployerRole = iam.Role.fromRoleArn(this, 'ProdDeployerRole',
      prodDeployerRoleArn, {
        mutable: false
      }
    );

    const prodCrossAccountRole = iam.Role.fromRoleArn(this, 'ProdCrossAccountRole',
      prodCrossAccountRoleArn, {
        mutable: false
      }
    );

    // S3 bucket where build artifacts will be stored
    // Needs to be encrypted with a CMK key because we need to share this
    // key with the PROD account to be able to deploy to across accounts.
    const artifactsBucket = new s3.Bucket(this, "ArtifactsBucket", {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: new kms.Key(this, 'KmsKey', {
        alias: 'awsdingler-serverless-api-cicd-kms-key',
        description: 'KMS key to deploy across accounts',
        enabled: true,
        enableKeyRotation: true,
      }),
    });

    // Add a bucket policy that grants production
    // IAM roles access to the artifacts bucket.
    artifactsBucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [artifactsBucket.arnForObjects("*")],
      principals: [
        prodDeployerRole.grantPrincipal,
        prodCrossAccountRole.grantPrincipal
      ]
    }));

    // Pipeline creation starts
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      artifactBucket: artifactsBucket
    });

    /**
     * SOURCE STAGE
     */

    // Declare source code as an artifact
    const sourceOutput = new codepipeline.Artifact();

    // Source stage
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new codepipeline_actions.GitHubSourceAction({
          actionName: 'GitHub',
          owner: 'ferdingler',
          oauthToken: githubToken,
          repo: 'awsdingler-serverless-api',
          output: sourceOutput,
        }),
      ],
    });

    /**
     * BUILD STAGE
     */
    
    // Declare build output as artifacts
    const buildOutput = new codepipeline.Artifact();

    // CodeBuild project definition
    const buildProject = new codebuild.PipelineProject(this, 'Build', {
      environment: {
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2,
        computeType: codebuild.ComputeType.SMALL
      },
      environmentVariables: {
        'PACKAGE_BUCKET': {
          value: artifactsBucket.bucketName
        }
      }
    });

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: 'Build',
          project: buildProject,
          input: sourceOutput,
          outputs: [buildOutput],
        }),
      ],
    });

    /**
     * DEV STAGE
     */
    const integTestsLambdaArn = cdk.Fn.importValue("awsdingler-serverless-api-integ-tests-arn-dev");
    pipeline.addStage({
      stageName: 'Dev',
      actions: [
        new codepipeline_actions.CloudFormationCreateReplaceChangeSetAction({
          actionName: 'CreateChangeSet',
          templatePath: buildOutput.atPath("packaged.yaml"),
          stackName: 'awsdingler-serverless-api-dev',
          adminPermissions: true,
          changeSetName: 'awsdingler-serverless-api-dev-changeset',
          runOrder: 1,
          parameterOverrides: {
            'Environment': 'dev',
            'AutoScalingGroupName': k8sASGDev,
          }
        }),
        new codepipeline_actions.CloudFormationExecuteChangeSetAction({
          actionName: 'Deploy',
          stackName: 'awsdingler-serverless-api-dev',
          changeSetName: 'awsdingler-serverless-api-dev-changeset',
          runOrder: 2
        }),
        /**
         * Integration tests that run on a Lambda function.
         * Lambda ARN is imported from CloudFormation output values
         */
        new codepipeline_actions.LambdaInvokeAction({
          actionName: 'IntegrationTests',
          runOrder: 3,
          lambda: lambda.Function.fromFunctionArn(
            this, 
            "IntegrationTestsDev", 
            integTestsLambdaArn
          ),
        })
      ],
    });

    /**
     * PROD STAGE
     */
    pipeline.addStage({
      stageName: 'Prod',
      actions: [
        new codepipeline_actions.CloudFormationCreateReplaceChangeSetAction({
          actionName: 'CreateChangeSet',
          runOrder: 1,
          templatePath: buildOutput.atPath("packaged.yaml"),
          stackName: 'awsdingler-serverless-api-prod',
          adminPermissions: true,
          changeSetName: 'awsdingler-serverless-api-prod-changeset',
          /**
           * Specifying a role in Prod is the key that allows
           * the deployment to happen in the production account.
           */
          deploymentRole: prodDeployerRole,
          role: prodCrossAccountRole,
          parameterOverrides: {
            'Environment': 'prod',
            'AutoScalingGroupName': k8sASGProd,
          }
        }),
        /**
         * Manual approval before executing ChangeSet
         */
        new codepipeline_actions.ManualApprovalAction({
          actionName: 'Approval',
          runOrder: 2,
        }),
        new codepipeline_actions.CloudFormationExecuteChangeSetAction({
          actionName: 'Deploy',
          runOrder: 3,
          stackName: 'awsdingler-serverless-api-prod',
          changeSetName: 'awsdingler-serverless-api-prod-changeset',
          role: prodCrossAccountRole,
        }),
      ],
    });
    
  }
}
