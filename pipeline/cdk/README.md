# CI/CD Pipeline

This folder contains the definition of the continous integration and delivery pipeline for the project. It is a multi stage cross-account CodePipeline defined using the AWS CDK. It uses GitHub, CodeBuild and CloudFormation.

## How to create the pipeline

First, create a secret in AWS Secrets Manager as described in the _Secrets_ section below. Then build this CDK project by running: 

```
npm run build
```

Then deploy:

```
cdk deploy
```

## Secrets

The pipeline takes dynamic values from a secret in Secrets Manager named `awsdingler-serverless-api-cicd`. The secret must contain the following json keys: 

- **Key**: github-oauth-token
- **Key**: k8s-asg-dev
- **Key**: k8s-asg-prod

## Other Supported Commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template