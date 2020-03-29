import * as cdk from '@aws-cdk/core';
import sm = require("@aws-cdk/aws-secretsmanager");
import s3 = require('@aws-cdk/aws-s3');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import codebuild = require('@aws-cdk/aws-codebuild');
import lambda = require('@aws-cdk/aws-lambda');
import kms = require('@aws-cdk/aws-kms');

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket where build artifacts will be stored
    // Needs to be encrypted with a CMK key because we need to share this
    // key with the PROD account to be able to deploy to across accounts.
    const artifactsBucket = new s3.Bucket(this, "ArtifactsBucket", {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: new kms.Key(this, 'KmsKey', {
        alias: 'awsdingler-serverless-api-cicd-kms-key',
        description: 'Key to deploy across accounts',
        enabled: true,
        enableKeyRotation: true,
      }),
    });

    // Secrets Manager secret name for dynamic parameters (Check README)
    const secretName = "awsdingler-serverless-api-cicd";

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
          oauthToken: cdk.SecretValue.secretsManager(secretName, {
            jsonField: 'github-oauth-token'
          }),
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
            'AutoScalingGroupName': cdk.SecretValue.secretsManager(secretName, {
              jsonField: 'k8s-asg-dev'
            }),
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
          lambda: lambda.Function.fromFunctionArn(this, "IntegrationTestsDev", integTestsLambdaArn),
        })
      ],
    });
    
  }
}
