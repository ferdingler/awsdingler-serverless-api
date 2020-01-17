const AWS = require('aws-sdk');
const health = require('./k8sDashboard/health');
const spot = require('./k8sDashboard/spot');
const watchTower = require('./k8sDashboard/watchtower');
const moment = require('moment');

const s3Bucket = process.env['RESULTS_S3_BUCKET'];
const autoScalingGroupName = process.env['AUTO_SCALING_GROUP_NAME'];

const s3 = new AWS.S3();
const exportToS3 = async (results) => {
    console.log('Uploading results to S3');
    const upload = await s3.upload({
        Bucket: s3Bucket,
        Key: 'latest.json',
        Body: JSON.stringify(results),
        ACL: 'public-read',
    }).promise();
    console.log('Upload Successful', upload);
    return upload;
};

exports.k8sDashboard = async () => {
    const snapshot = moment();
    console.log('Environment variables');
    console.log('Snapshot', snapshot.toISOString());
    console.log('AutoScalingGroupName', autoScalingGroupName);
    let healthResult;

    try {
        console.log('Calculating health');
        healthResult = await health.readDashboardHealth(snapshot);
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

        return exportToS3({
            health: healthResult,
            cpuMetrics,
            instances,
            latency,
            pingStatusCodes,
        });
    } catch (err) {
        console.log('Failed to generate Dashboard', err);
        throw err;
    }
};