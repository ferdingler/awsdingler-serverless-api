import * as cdk from '@aws-cdk/core';
import { Metric, GraphWidget } from '@aws-cdk/aws-cloudwatch';
import {
    GREEN,
    BLUE,
    ORANGE,
    PURPLE,
    RED
} from './colors';

export interface ApiWidgetProps {
    apiName: string,
    widgetTitle: string,
    width: number,
    height: number
}

export class ApiGatewayWidgets {

    static requestsWidget(props: ApiWidgetProps): GraphWidget {
        const metrics = [
            new Metric({
                metricName: 'Count',
                namespace: 'AWS/ApiGateway',
                color: GREEN,
                dimensions: { ApiName: props.apiName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
            new Metric({
                metricName: '4XXError',
                namespace: 'AWS/ApiGateway',
                color: ORANGE,
                dimensions: { ApiName: props.apiName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
            new Metric({
                metricName: '5XXError',
                namespace: 'AWS/ApiGateway',
                color: RED,
                dimensions: { ApiName: props.apiName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
        ];

        const rightMetrics = [
            new Metric({
                metricName: 'Latency',
                namespace: 'AWS/ApiGateway',
                color: BLUE,
                dimensions: { ApiName: props.apiName },
                period: cdk.Duration.minutes(1),
                statistic: 'p99',
                label: 'p99'
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