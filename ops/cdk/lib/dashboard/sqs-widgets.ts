import * as cdk from '@aws-cdk/core';
import { Metric, GraphWidget } from '@aws-cdk/aws-cloudwatch';
import {
    GREEN,
    BLUE,
    ORANGE,
    PURPLE,
    RED
} from './colors';

export interface SqsWidgetProps {
    queueName: string,
    widgetTitle: string,
    width: number,
    height: number
}

export class SqsWidgets {

    static messagesWidget(props: SqsWidgetProps): GraphWidget {
        const metrics = [
            new Metric({
                metricName: 'ApproximateNumberOfMessagesNotVisible',
                namespace: 'AWS/SQS',
                color: BLUE,
                dimensions: { QueueName: props.queueName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
                label: 'Messages In Flight'
            }),
            new Metric({
                metricName: 'NumberOfMessagesReceived',
                namespace: 'AWS/SQS',
                color: GREEN,
                dimensions: { QueueName: props.queueName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
            new Metric({
                metricName: 'NumberOfMessagesDeleted',
                namespace: 'AWS/SQS',
                color: RED,
                dimensions: { QueueName: props.queueName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
        ];
        
        return new GraphWidget({
            title: props.widgetTitle,
            width: props.width,
            height: props.height,
            left: metrics,
        });
    }
}