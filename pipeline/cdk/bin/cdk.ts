#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../lib/pipeline-stack';
import { ProdIAMStack } from '../lib/prod-iam-stack';

const app = new cdk.App();

new PipelineStack(app, 'awsdingler-serverless-api-cicd');
new ProdIAMStack(app, 'awsdingler-serverless-api-cicd-prod');
