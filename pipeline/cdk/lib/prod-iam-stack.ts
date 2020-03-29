import * as cdk from '@aws-cdk/core';
import iam = require('@aws-cdk/aws-iam');
import params = require('../params.json');

export class ProdIAMStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      /**
     * Parameters
     * Taken from local file `params.json`. Generally is better
     * to take these parameters from ParameterStore or SecretsManager,
     * but I am doing it this way for simplicity.
     */
      const devAccount = params["dev-account-id"];

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
          assumedBy: new iam.AccountPrincipal(devAccount),
      });

      // Needs CloudFormation permissions
      const cfnFullAccessPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName("AWSCloudFormationFullAccess");
      crossAccountRole.addManagedPolicy(cfnFullAccessPolicy);

      // Needs permissions to pass the cloudFormationRole defined above
      crossAccountRole.addToPolicy(new iam.PolicyStatement({
          actions: ['iam:PassRole'],
          resources: [cloudformationRole.roleArn]
      }));

      // Needs S3 permissions to access artifacts in the DEV account
      crossAccountRole.addToPolicy(new iam.PolicyStatement({
          actions: ['s3:GetObject'],
          resources: ['*']
      }));

      // Needs KMS permissions to decrypt objects in the DEV account
      crossAccountRole.addToPolicy(new iam.PolicyStatement({
          actions: ['kms:Decrypt'],
          resources: ['*']
      }));

      /**
       * Outputs
       */
      new cdk.CfnOutput(this, 'ProdCrossAccountRoleArn', {
          value: crossAccountRole.roleArn,
      });

      new cdk.CfnOutput(this, 'CloudFormationDeployRoleArn', {
        value: cloudformationRole.roleArn,
    })

    }
}