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

## Other Supported Commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template