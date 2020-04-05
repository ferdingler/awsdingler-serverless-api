import * as cdk from '@aws-cdk/core';
import { Metric, GraphWidget, IMetric } from '@aws-cdk/aws-cloudwatch';
import {
    GREEN,
    BLUE,
    ORANGE,
    PURPLE,
    RED
} from './colors';

export interface LambdaWidgetProps {
    functionName: string,
    widgetTitle: string,
    withProvisionedConcurrency: boolean,
    width: number,
    height: number
}

export class LambdaWidgets {

    static invocationsWidget(props: LambdaWidgetProps): GraphWidget {
        const metrics = [
            new Metric({
                metricName: 'Invocations',
                namespace: 'AWS/Lambda',
                color: ORANGE,
                dimensions: { FunctionName: props.functionName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
            new Metric({
                metricName: 'Errors',
                namespace: 'AWS/Lambda',
                color: RED,
                dimensions: { FunctionName: props.functionName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
            new Metric({
                metricName: 'Throttles',
                namespace: 'AWS/Lambda',
                color: GREEN,
                dimensions: { FunctionName: props.functionName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }),
        ];

        if (props.withProvisionedConcurrency) {
            metrics.push(new Metric({
                metricName: 'ProvisionedConcurrencySpilloverInvocations',
                namespace: 'AWS/Lambda',
                color: PURPLE,
                dimensions: { FunctionName: props.functionName },
                period: cdk.Duration.minutes(1),
                statistic: 'Sum',
            }));
        }

        return this.lambdaWidget(props, metrics);
    }

    static concurrencyWidget(props: LambdaWidgetProps): GraphWidget {
        const metrics = [
            new Metric({
                metricName: 'ConcurrentExecutions',
                namespace: 'AWS/Lambda',
                color: ORANGE,
                dimensions: { FunctionName: props.functionName },
                period: cdk.Duration.minutes(1),
                statistic: 'Maximum',
            }),
        ];

        if (props.withProvisionedConcurrency) {
            metrics.push(new Metric({
                metricName: 'ProvisionedConcurrentExecutions',
                namespace: 'AWS/Lambda',
                color: BLUE,
                dimensions: { FunctionName: props.functionName },
                period: cdk.Duration.minutes(1),
                statistic: 'Maximum',
            }));
        }

        return this.lambdaWidget(props, metrics);
    }

    static latencyWidget(props: LambdaWidgetProps): GraphWidget {
        const metrics = [
            new Metric({
                metricName: 'Duration',
                namespace: 'AWS/Lambda',
                color: BLUE,
                dimensions: { FunctionName: props.functionName },
                period: cdk.Duration.minutes(1),
                statistic: 'p99',
                label: 'p99',
            }),
        ];
        return this.lambdaWidget(props, metrics);
    }

    static lambdaWidget(props: LambdaWidgetProps, metrics: IMetric[]): GraphWidget {
        return new GraphWidget({
            title: props.widgetTitle,
            width: props.width,
            height: props.height,
            left: metrics,
        });
    }
}