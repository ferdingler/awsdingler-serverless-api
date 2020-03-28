# CI/CD Pipeline

This is the ci/cd pipeline definition for the awsdingler-serverless-api microservice. It is a mult-stage cross-account pipeline defined using the AWS CDK. 

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## Secrets

The pipeline takes dynamic values from Secrets Manager and it expects the following secrets to exist: 

- `awsdingler-serverless-api-github-token`