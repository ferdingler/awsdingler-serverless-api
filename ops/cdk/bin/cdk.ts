#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../lib/pipeline-stack';
import { ProdIAMStack } from '../lib/prod-iam-stack';
import params = require('../params.json');

const app = new cdk.App();

/**
 * Environment Definition
 */
const prod = {
    account: params["prod-account-id"],
    region: 'us-west-2',
};

const dev = {
    account: params["dev-account-id"],
    region: 'us-west-2',
};

/**
 * Stack to deploy in the DEV account
 */
const devStack = new PipelineStack(app, 'awsdingler-serverless-api-cicd', {
    env: dev 
});

/**
 * Stack to deploy in the PROD account
 */
const prodStack = new ProdIAMStack(app, 'awsdingler-serverless-api-cicd-prod', {
    env: prod
});

/**
 * Add tagging
 */
cdk.Tag.add(devStack, 'workload', 'awsdingler-serverless');
cdk.Tag.add(prodStack, 'workload', 'awsdingler-serverless');