# Operations

This folder contains a CDK project to programmatically launch Ops related resources like a CI/CD pipeline, IAM roles for the production account and a CloudWatch dashboard. 

## Parameters JSON

To deploy the pipeline, first create a file `params.json` with the following key-value pairs. You will need to wait to add some of the values after deploying the Prod stack. 

```
{
    "github-oauth-token": "123456",
    "k8s-asg-dev": "eksctl-awsdingler-k8s-nodegroup-bananas-1-15-NodeGroup-120RTWN80ZI2W",
    "k8s-asg-prod": "eksctl-awsdingler-k8s-nodegroup-bananas-1-15-NodeGroup-120RTWN80ZI2W",
    "cross-account-prod-role-arn": "arn:aws:iam::1234567890:role/CrossAccountRole",
    "prod-deployer-role-arn": "arn:aws:iam::1234567890:role/CloudFormationDeployRole",
    "dev-account-id": "987654321",
    "prod-account-id": "123456789"
}
```

## Deploy the pipeline

Build the CDK project by running: 

```
npm run build
```

Deploy the resources in the prod account:

```
cdk deploy awsdingler-serverless-api-cicd-prod --profile awsdingler
```

Write down the CrossAccountRoleArn and DeployerRole from the Outputs section and add it to the `params.json` file. Now you can deploy the pipeline in the Dev account:

```
cdk deploy awsdingler-serverless-api-cicd --profile dev
```

## Deploy Ops Dashboard

Ops dashboard is implemented as a CloudWatch dashboard on its own CDK stack. To deploy it, you first need to have deployed the DEV and PROD stacks first because the dashboard displays metrics for those resources and if they don't exist, no metrics can be displayed. 

Add the following entries to the `params.json` file: 

```
"ops-dashboard": {
    "dev": {
        "helloWorldFunctionName": "awsdingler-serverless-api-dev-HelloWorldFunction-123",
        "helloQueueProcessorName": "awsdingler-serverless-api-dev-HelloQueueProcessor-123",
        "apiGatewayName": "awsdingler-api-dev",
        "helloSqsQueueName": "awsdingler-serverless-api-dev-HelloQueue-123",
        "dynamoHelloMessagesTableName": "awsdingler-serverless-api-dev-HelloMessagesTable-123",
        "kubernetesDashboardFunctionName": "awsdingler-serverless-api-dev-KubernetesDashboard-123"
    },
    "prod": {
        "helloWorldFunctionName": "awsdingler-serverless-api-prod-HelloWorldFunction-123",
        "helloQueueProcessorName": "awsdingler-serverless-api-prod-HelloQueueProcessor-123",
        "apiGatewayName": "awsdingler-api-prod",
        "helloSqsQueueName": "awsdingler-serverless-api-prod-HelloQueue-123",
        "dynamoHelloMessagesTableName": "awsdingler-serverless-api-prod-HelloMessagesTable-123",
        "kubernetesDashboardFunctionName": "awsdingler-serverless-api-prod-KubernetesDashboard-123"
    }
}
```

Then deploy the dashboard in either environment: 

```
cdk deploy serverless-api-ops-dev
cdk deploy serverless-api-ops-prod
```

## Other Supported Commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template