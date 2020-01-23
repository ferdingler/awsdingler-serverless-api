const moment = require('moment');
const health = require('./health');
const spot = require('./spot');
const watchTower = require('./watchtower');

const autoScalingGroupName = process.env['AUTO_SCALING_GROUP_NAME'];

exports.buildDashboardData = async () => {
    const snapshot = moment();
    console.log('Environment variables');
    console.log('Snapshot', snapshot.toISOString());
    console.log('AutoScalingGroupName', autoScalingGroupName);

    console.log('Calculating health');
    const healthResult = await health.readDashboardHealth(snapshot);
    console.log('Health=', healthResult);

    console.log('Calculating CPU utilization');
    const cpuMetrics = await spot.cpuAverageUtilization(snapshot, autoScalingGroupName);
    console.log('CpuMetrics count=', cpuMetrics.length);

    console.log('Listing Spot Instances');
    const instances = await spot.listSpotInstances(autoScalingGroupName);
    console.log('Got instances=', instances);

    console.log('Getting latency from watchtower metrics');
    const latency = await watchTower.latencies(snapshot);
    console.log('Got latencies', latency);

    console.log('Getting availability from watchtower metrics');
    const pingStatusCodes = await watchTower.pingStatusCodes(snapshot);
    console.log('Got availability', pingStatusCodes);

    return {
        health: healthResult,
        cpuMetrics,
        instances,
        latency,
        pingStatusCodes,
    };
};