import * as cdk from '@aws-cdk/core';
import iam = require('@aws-cdk/aws-iam');

export class ProdIAMStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      // Secrets Manager secret name for dynamic parameters (Check README)
      const secretName = "awsdingler-serverless-api-cicd";
      const devAccount = cdk.SecretValue.secretsManager(secretName, {
        jsonField: 'dev-account-id'
      });

      /**
       * IAM Role for CloudFormation
       * This is the role that will be used to deployed 
       * the production stack. Needs admin permissions.
       */
      const cloudformationRole = new iam.Role(this, 'CloudFormationDeployRole', {
        assumedBy: new iam.ServicePrincipal('cloudformation.amazonaws.com')
      });

      const adminPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess");
      cloudformationRole.addManagedPolicy(adminPolicy);

      /**
       * IAM Role for cross-account access
       * This role will be assumed by the CodePipeline in 
       * the dev account. So this role needs the ability to PassRole 
       * so that it can pass the Cloudformation role defined above.
       */
      const crossAccountRole = new iam.Role(this, 'CrossAccountRole', {
          assumedBy: new iam.AccountPrincipal(devAccount)
      });

      /**
       * Outputs
       */
      new cdk.CfnOutput(this, 'ProdCrossAccountRoleArn', {
          value: crossAccountRole.roleArn,
      })

    }
}