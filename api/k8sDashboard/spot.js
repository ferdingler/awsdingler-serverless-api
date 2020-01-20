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

    console.log('AutoScaling Groups=', JSON.stringify(asgGroups));
    const group = _.first(asgGroups.AutoScalingGroups);
    const instanceIds = group.Instances.map(instance => instance.InstanceId);
    console.log('InstanceIds=', instanceIds);
    const result = await ec2.describeInstances({ InstanceIds: instanceIds }).promise();
    console.log('Describe instances=', result);

    if (!result.Reservations) {
        console.log('No instances found, returning empty');
        return [];
    }

    const instances = [];
    result.Reservations.forEach(reservation => {
        reservation.Instances.forEach(instance => {
            instances.push({
                InstanceType: instance.InstanceType,
                InstanceId: instance.InstanceId.substring(0, 10),
                LaunchTime: instance.LaunchTime,
                AvailabilityZone: instance.Placement.AvailabilityZone,
                Status: instance.State.Name,
            });
        });
    });

    return instances;
};