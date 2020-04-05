import * as cdk from '@aws-cdk/core';
import { Metric, GraphWidget } from '@aws-cdk/aws-cloudwatch';
import {
    GREEN,
    BLUE,
    ORANGE,
    PURPLE,
    RED
} from './colors';

export interface DynamoWidgetProps {
    tableName: string,
    widgetTitle: string,
    width: number,
    height: number
}

export class DynamoDBWidgets {

    static putItemWidget(props: DynamoWidgetProps): GraphWidget {
        const metrics = [
            new Metric({
                metricName: 'SuccessfulRequestLatency',
                namespace: 'AWS/DynamoDB',
                color: BLUE,
                dimensions: {
                    TableName: props.tableName,
                    Operation: "PutItem"
                },
                period: cdk.Duration.minutes(1),
                statistic: 'Average',
            }),
        ];

        const rightMetrics = [
            new Metric({
                metricName: 'ThrottledRequests',
                namespace: 'AWS/DynamoDB',
                color: RED,
                dimensions: {
                    TableName: props.tableName,
                    Operation: "PutItem"
                },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
        ];
        
        return new GraphWidget({
            title: props.widgetTitle,
            width: props.width,
            height: props.height,
            left: metrics,
            right: rightMetrics,
        });
    }
}