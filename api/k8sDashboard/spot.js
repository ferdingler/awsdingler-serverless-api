const AWS = require('aws-sdk');
const _ = require('lodash');

const cloudWatch = new AWS.CloudWatch();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const autoScaling = new AWS.AutoScaling();

exports.lastTermination = async (spotTerminationsTable) => {
    const terminations = await dynamoDb.scan({
        TableName: spotTerminationsTable,
    }).promise();

    if (_.isEmpty(terminations.Items)) {
        throw new Error('Nothing found on DynamoDB table');
    }

    const sorted = _.sortBy(terminations.Items, (item) => new Date(item.timestamp));
    const lastItem = _.last(sorted);
    return {
        ...lastItem,
        // don't want to expose these values publicly
        instanceId: lastItem.instanceId.substring(0, 8),
        fleetId: lastItem.fleetId.substring(0, 10),
    };
};

exports.cpuAverageUtilization = async (snapshot, autoScalingGroupName) => {
    const cpuMetrics = await cloudWatch.getMetricStatistics({
        EndTime: snapshot.toISOString(),
        StartTime: snapshot.subtract(12, 'hour').toISOString(),
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/EC2',
        Period: 300,
        Dimensions: [
            {
                Name: 'AutoScalingGroupName',
                Value: autoScalingGroupName
            },
        ],
        Statistics: [
            'Average'
        ],
    }).promise();

    console.log('Got cpu metrics', JSON.stringify(cpuMetrics));
    return cpuMetrics.Datapoints;
};

exports.listSpotInstances = async (autoScalingGroupName) => {
    const asgGroups = await autoScaling.describeAutoScalingGroups({
        AutoScalingGroupNames: [autoScalingGroupName],
    }).promise();

    const group = _.first(asgGroups.AutoScalingGroups);
    return group.Instances.map(instance => {
        return {
            InstanceType: instance.InstanceId,
            InstanceHealth: instance.LifecycleState,
            InstanceId: instance.InstanceId.substring(0, 8)
        }
    });
};