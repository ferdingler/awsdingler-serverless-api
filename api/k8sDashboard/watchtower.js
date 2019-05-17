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

exports.calculateAvailability = async (snapshot, uptimeRobotUrl, uptimeRobotApiKey, uptimeRobotMonitorId) => {
    try {
        const uptimeRobotEndpoint = uptimeRobotUrl.concat('/getMonitors');
        const response = await axios.post(uptimeRobotEndpoint, {
            api_key: uptimeRobotApiKey,
            monitors: uptimeRobotMonitorId,
            all_time_uptime_ratio: 1
        });

        console.log('Got response from uptime robot = ', JSON.stringify(response.data));
        const monitor = response.data.monitors[0];
        return {
            monitorSinceDate: monitor['create_datetime'],
            uptimeRatio: parseFloat(monitor['all_time_uptime_ratio']),
            monitorIntervalSeconds: monitor['interval'],
        };

    } catch (err) {
        console.log('Call to uptime robot failed with error =', err);
        return {
            monitorSinceDate: 0,
            uptimeRatio: 0,
            monitorIntervalSeconds: 0,
        };
    }
};