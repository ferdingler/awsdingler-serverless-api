const AWS = require('aws-sdk');
const _ = require('lodash');
const cloudWatch = new AWS.CloudWatch();

exports.readDashboardHealth = async (snapshot) => {
    const metrics = await cloudWatch.getMetricData({
        EndTime: snapshot.toISOString(),
        StartTime: snapshot.subtract(1, 'minute').toISOString(),
        MetricDataQueries: [
            {
                Id: 'httpStatus',
                MetricStat: {
                    Metric: {
                        Dimensions: [
                            {
                                Name: 'awsdingler-k8s-nlb',
                                Value: 'HTTP Status'
                            },
                        ],
                        MetricName: 'status',
                        Namespace: 'Watchtower'
                    },
                    Period: 60,
                    Stat: 'Maximum',
                },
            },
        ],
    }).promise();

    if (_.isEmpty(metrics.MetricDataResults)) {
        throw new Error('No metrics found for Watchtower/HTTP Status');
    }

    const first = metrics.MetricDataResults[0];
    return {
        timestamp: first.Timestamps[0],
        httpStatus: first.Values[0],
    };
};