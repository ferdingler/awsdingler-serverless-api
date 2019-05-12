const AWS = require('aws-sdk');
const _ = require('lodash');

const cloudWatch = new AWS.CloudWatch();

const buildResponse = (p90, p99, p50) => {
    return {
        p90,
        p99,
        p50
    };
};

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
        return buildResponse(0, 0, 0 );
    }

    const stats = latencyMetrics.Datapoints[0]['ExtendedStatistics'];
    return buildResponse(stats.p90, stats.p99, stats.p50);
};