# CI/CD Pipeline

This folder contains the definition of the continous integration and delivery pipeline for the project. It is a multi stage cross-account CodePipeline defined using the AWS CDK. It uses GitHub, CodeBuild and CloudFormation.

## How to create the pipeline

1) First, create secrets in AWS Secrets Manager as described in the _Secrets_ section below. Then build this CDK project by running: 

```
npm run build
```

2) Deploy the resources in the prod account:

```
cdk deploy awsdingler-serverless-api-cicd-prod
```

Write down the CrossAccountRoleArn from the Outputs section and add it to the secret in the Dev account.

3) Deploy the pipeline in the dev account:

```
cdk deploy awsdingler-serverless-api-cicd
```

## Secrets

The pipeline takes dynamic values from Secrets Manager, you need to create a Secret in the dev account and one in the prod account. The following describes each of them. 

### In the Dev account

Secret Name: `awsdingler-serverless-api-cicd` with the following json keys: 

- **Key**: github-oauth-token
- **Key**: k8s-asg-dev
- **Key**: k8s-asg-prod

### In the Prod account

Secret Name: `awsdingler-serverless-api-cicd` with the following json keys: 

- **Key**: dev-account-id

## Other Supported Commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template