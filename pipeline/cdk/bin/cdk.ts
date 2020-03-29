#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../lib/pipeline-stack';
import { ProdIAMStack } from '../lib/prod-iam-stack';
import params = require('../params.json');

const app = new cdk.App();

const prod = {
    account: params["prod-account-id"],
    region: 'us-west-2',
};

const dev = {
    account: params["dev-account-id"],
    region: 'us-west-2',
};

new PipelineStack(app, 'awsdingler-serverless-api-cicd', { env: dev });
new ProdIAMStack(app, 'awsdingler-serverless-api-cicd-prod', { env: prod });
