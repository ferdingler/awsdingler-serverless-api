const AWS = require('aws-sdk');
const _ = require('lodash');

const cloudWatch = new AWS.CloudWatch();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const ec2 = new AWS.EC2();

exports.lastTermination = async (spotTerminationsTable, spotFleetId) => {
    const terminations = await dynamoDb.query({
        TableName: spotTerminationsTable,
        KeyConditionExpression: 'fleetId = :hkey',
        ScanIndexForward: false,
        ExpressionAttributeValues: {
            ':hkey': spotFleetId,
        }
    }).promise();

    if (_.isEmpty(terminations.Items)) {
        throw new Error('Nothing found on DynamoDB table');
    }

    const lastItem = terminations.Items[0];
    return {
        ...lastItem,
        // don't want to expose these values publicly
        instanceId: lastItem.instanceId.substring(0, 8),
        fleetId: lastItem.fleetId.substring(0, 10),
    };
};

exports.cpuAverageUtilization = async (snapshot, spotFleetId) => {
    const cpuMetrics = await cloudWatch.getMetricStatistics({
        EndTime: snapshot.toISOString(),
        StartTime: snapshot.subtract(12, 'hour').toISOString(),
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/EC2Spot',
        Period: 300,
        Dimensions: [
            {
                Name: 'FleetRequestId',
                Value: spotFleetId
            },
        ],
        Statistics: [
            'Average'
        ],
    }).promise();

    console.log('Got cpu metrics', JSON.stringify(cpuMetrics));
    return cpuMetrics.Datapoints;
};

exports.listSpotInstances = async (spotFleetId) => {
    const instances = await ec2.describeSpotFleetInstances({
        SpotFleetRequestId: spotFleetId,
    }).promise();

    return instances.ActiveInstances.map(instance => {
        return {
            InstanceType: instance.InstanceType,
            InstanceHealth: instance.InstanceHealth,
            InstanceId: instance.InstanceId.substring(0, 8)
        }
    });
};