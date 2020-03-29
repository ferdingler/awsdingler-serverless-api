# CI/CD Pipeline

This folder contains the definition of the continous integration and delivery pipeline for the project. It is a multi stage cross-account CodePipeline defined using the AWS CDK. It uses GitHub, CodeBuild and CloudFormation.

## How to create the pipeline

1) First, create `params.json` file as described bellow. Then build this CDK project by running: 

```
npm run build
```

2) Deploy the resources in the prod account:

```
cdk deploy awsdingler-serverless-api-cicd-prod --profile awsdingler
```

Write down the CrossAccountRoleArn from the Outputs section and add it to the params.json file.

3) Deploy the pipeline in the dev account:

```
cdk deploy awsdingler-serverless-api-cicd --profile dev
```

## Parameters

The pipeline takes dynamic values from file `params.json` with the following structure:

```
{
    "github-oauth-token": "123",
    "k8s-asg-dev": "eksctl-awsdingler-k8s-nodegroup",
    "k8s-asg-prod": "eksctl-awsdingler-k8s-nodegroup",
    "cross-account-prod-role-arn": "arn:aws:iam::123:role/CrossAccountRole"
}
```

## Other Supported Commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template