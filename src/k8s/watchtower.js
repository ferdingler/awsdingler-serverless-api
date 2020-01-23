const AWS = require('aws-sdk');
const axios = require('axios');
const _ = require('lodash');

const cloudWatch = new AWS.CloudWatch();

exports.latencies = async (snapshot) => {
    const latencyMetrics = await cloudWatch.getMetricStatistics({
        EndTime: snapshot.toISOString(),
        StartTime: snapshot.subtract(1, 'hour').toISOString(),
        MetricName: 'timing-total',
        Namespace: 'Watchtower',
        Period: 3600,
        Dimensions: [
            {
                Name: 'awsdingler-k8s-nlb',
                Value: 'Timing: total'
            },
        ],
        ExtendedStatistics: [
            'p90',
            'p99',
            'p50'
        ],
    }).promise();

    console.log('Got latency metrics', JSON.stringify(latencyMetrics));
    if (_.isEmpty(latencyMetrics.Datapoints)) {
        return {
            p50: 0,
            p90: 0,
            p99: 0,
        };
    }

    const stats = latencyMetrics.Datapoints[0]['ExtendedStatistics'];
    return {
        p50: stats.p50,
        p90: stats.p90,
        p99: stats.p99,
    };
};

exports.pingStatusCodes = async (snapshot) => {
    const statusCodeMetrics = await cloudWatch.getMetricStatistics({
        EndTime: snapshot.toISOString(),
        StartTime: snapshot.subtract(7, 'days').toISOString(),
        MetricName: 'status',
        Namespace: 'Watchtower',
        Period: 3600,
        Dimensions: [
            {
                Name: 'awsdingler-k8s-nlb',
                Value: 'HTTP Status'
            },
        ],
        Statistics: [
            'Maximum'
        ],
    }).promise();

    console.log('Got http status code metrics', JSON.stringify(statusCodeMetrics));
    return statusCodeMetrics.Datapoints;
};