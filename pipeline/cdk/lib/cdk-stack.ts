import * as cdk from '@aws-cdk/core';
import sm = require("@aws-cdk/aws-secretsmanager");
import s3 = require('@aws-cdk/aws-s3');
import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import codebuild = require('@aws-cdk/aws-codebuild');

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const artifactsBucket = new s3.Bucket(this, "ArtifactsBucket");

    // Secrets Manager secret name for dynamic parameters (Check README)
    const secretName = "awsdingler-serverless-api-cicd";

    // Pipeline creation starts
    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      artifactBucket: artifactsBucket
    });

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

    // Declare build output as artifacts
    const buildOutput = new codepipeline.Artifact();

    // CodeBuild project
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

    // Build stage
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

    // DEV stage
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
      ],
    });
    
  }
}
