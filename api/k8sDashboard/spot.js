const AWS = require('aws-sdk');
const _ = require('lodash');

const cloudWatch = new AWS.CloudWatch();
const autoScaling = new AWS.AutoScaling();
const ec2 = new AWS.EC2();

exports.cpuAverageUtilization = async (snapshot, autoScalingGroupName) => {
    const cpuMetrics = await cloudWatch.getMetricStatistics({
        EndTime: snapshot.toISOString(),
        StartTime: snapshot.subtract(7, 'days').toISOString(),
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/EC2',
        Period: 3600,
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
    const instanceIds = group.Instances.map(instance => instance.InstanceId);
    const instances = await ec2.describeInstances({ InstanceIds: instanceIds }).promise();

    return instances.map(instance => {
        return {
            InstanceType: instance.InstanceId,
            InstanceHealth: instance.LifecycleState,
            InstanceId: instance.InstanceId.substring(0, 8),
            LaunchTime: instance.LaunchTime,
            AvailabilityZone: instance.Placement.AvailabilityZone,
            Status: instance.State.Name,
        }
    });
};