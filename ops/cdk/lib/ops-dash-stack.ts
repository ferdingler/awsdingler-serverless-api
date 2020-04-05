import * as cdk from '@aws-cdk/core';
import params = require('../params.json');
import { Dashboard } from '@aws-cdk/aws-cloudwatch';
import { LambdaWidgets } from './dashboard/lambda-widgets';
import { ApiGatewayWidgets } from './dashboard/apigw-widgets';
import { SqsWidgets } from './dashboard/sqs-widgets';
import { DynamoDBWidgets } from './dashboard/dynamodb-widgets';

/**
 * Global Constants
 */
const FULL_WIDTH = 24;
const HALF_WIDTH = 12;
const WIDGET_HEIGHT = 9;

export class OpsDashboardStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: EnvProps) {
        super(scope, id, props.stackProps);

        /**
         * Params
         */
        const dashboardParams = params["ops-dashboard"];
        const opsParams = props.isProd ? dashboardParams["prod"] : dashboardParams["dev"];

        const helloWorldFunctionName = opsParams["helloWorldFunctionName"];
        const helloQueueProcessorName = opsParams["helloQueueProcessorName"];
        const apiGatewayName = opsParams["apiGatewayName"];
        const helloSqsQueueName = opsParams["helloSqsQueueName"];
        const dynamoHelloMessagesTable = opsParams["dynamoHelloMessagesTableName"];
        const k8sDashboardFunctionName = opsParams["kubernetesDashboardFunctionName"]; 

        /**
         * Dashboard definition
         */
        const dashboard = new Dashboard(this, 'OpsDashboard', {
            dashboardName: 'awsdingler-serverless-api-ops',
        });

        /**
         * Api Gateway
         */
        dashboard.addWidgets(
            ApiGatewayWidgets.requestsWidget({
                apiName: apiGatewayName,
                widgetTitle: "API Requests",
                width: FULL_WIDTH,
                height: WIDGET_HEIGHT
            })  
        );

        /**
         * Hello World Function
         */
        dashboard.addWidgets(
            LambdaWidgets.latencyWidget({
                functionName: helloWorldFunctionName,
                widgetTitle: "Hello Lambda Latency",
                withProvisionedConcurrency: true,
                width: FULL_WIDTH,
                height: WIDGET_HEIGHT
            })
        );

        dashboard.addWidgets(
            LambdaWidgets.invocationsWidget({
                functionName: helloWorldFunctionName,
                widgetTitle: "Hello Lambda Invocations",
                withProvisionedConcurrency: true,
                width: HALF_WIDTH,
                height: WIDGET_HEIGHT
            }),
            LambdaWidgets.concurrencyWidget({
                functionName: helloWorldFunctionName,
                widgetTitle: "Hello Lambda Concurrency",
                withProvisionedConcurrency: true,
                width: HALF_WIDTH,
                height: WIDGET_HEIGHT
            })
        );

        /**
         * Queue Processor Lambda
         */
        dashboard.addWidgets(
            LambdaWidgets.latencyWidget({
                functionName: helloQueueProcessorName,
                widgetTitle: "Queue Processor Latency",
                withProvisionedConcurrency: false,
                width: FULL_WIDTH,
                height: WIDGET_HEIGHT
            })
        );

        dashboard.addWidgets(
            LambdaWidgets.invocationsWidget({
                functionName: helloQueueProcessorName,
                widgetTitle: "Queue Processor Invocations",
                withProvisionedConcurrency: false,
                width: HALF_WIDTH,
                height: WIDGET_HEIGHT
            }),
            LambdaWidgets.concurrencyWidget({
                functionName: helloQueueProcessorName,
                widgetTitle: "Queue Processor Concurrency",
                withProvisionedConcurrency: false,
                width: HALF_WIDTH,
                height: WIDGET_HEIGHT
            })
        );

        /**
         * SQS Queue
         */
        dashboard.addWidgets(
            SqsWidgets.messagesWidget({
                queueName: helloSqsQueueName,
                widgetTitle: "SQS Messages",
                width: FULL_WIDTH,
                height: WIDGET_HEIGHT
            })
        );

        /**
         * DynamoDB
         */
        dashboard.addWidgets(
            DynamoDBWidgets.putItemWidget({
                tableName: dynamoHelloMessagesTable,
                widgetTitle: "DynamoDB Hello Messages Table",
                width: FULL_WIDTH,
                height: WIDGET_HEIGHT
            })
        );

        /**\
         * Query Results Widget
         * Not supported by CDK at the moment
         * fields @timestamp, @duration, @xrayTraceId, @logStream, @requestId
            | sort @duration desc
            | limit 25
         */

         /**
          * Kubernetes Dashboard Lambda
          */
         dashboard.addWidgets(
            LambdaWidgets.latencyWidget({
                functionName: k8sDashboardFunctionName,
                widgetTitle: "Kubernetes Dashboard Latency",
                withProvisionedConcurrency: false,
                width: FULL_WIDTH,
                height: WIDGET_HEIGHT
            })
        );

        dashboard.addWidgets(
            LambdaWidgets.invocationsWidget({
                functionName: k8sDashboardFunctionName,
                widgetTitle: "Kubernetes Dashboard Invocations",
                withProvisionedConcurrency: false,
                width: HALF_WIDTH,
                height: WIDGET_HEIGHT
            }),
            LambdaWidgets.concurrencyWidget({
                functionName: k8sDashboardFunctionName,
                widgetTitle: "Kubernetes Dashboard Concurrency",
                withProvisionedConcurrency: false,
                width: HALF_WIDTH,
                height: WIDGET_HEIGHT
            })
        );

    }
}

interface EnvProps {
    isProd: boolean;
    stackProps: cdk.StackProps,
}