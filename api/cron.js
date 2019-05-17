const AWS = require('aws-sdk');
const health = require('./k8sDashboard/health');
const spot = require('./k8sDashboard/spot');
const watchTower = require('./k8sDashboard/watchtower');
const moment = require('moment');

const s3Bucket = process.env['RESULTS_S3_BUCKET'];
const spotTerminationsTable = process.env['SPOT_TERMINATIONS_TABLE'];
const spotFleetId = process.env['SPOT_FLEET_ID'];
const uptimeRobotUrl = process.env['UPTIME_ROBOT_URL'];
const uptimeRobotApiKey = process.env['UPTIME_ROBOT_API_KEY'];
const uptimeRobotMonitorId = process.env['UPTIME_ROBOT_MONITOR_ID'];

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
    console.log('SpotTerminationsTable', spotTerminationsTable);
    console.log('SpotFleetId', spotFleetId);
    console.log('UptimeRobotUrl', uptimeRobotUrl);
    console.log('UptimeRobotApiKey', uptimeRobotApiKey);
    console.log('UptimeRobotMonitorId', uptimeRobotMonitorId);
    let healthResult;

    try {
        console.log('Calculating health');
        healthResult = await health.readDashboardHealth(snapshot);
        console.log('Health=', healthResult);

        console.log('Calculating last spot termination');
        const lastSpotTermination = await spot.lastTermination(spotTerminationsTable, spotFleetId);
        console.log('LastSpotTermination=', lastSpotTermination);

        console.log('Calculating CPU utilization');
        const cpuMetrics = await spot.cpuAverageUtilization(snapshot, spotFleetId);
        console.log('CpuMetrics count=', cpuMetrics.length);

        console.log('Listing Spot Instances');
        const instances = await spot.listSpotInstances(spotFleetId);
        console.log('Got instances=', instances);

        console.log('Getting latency from watchtower metrics');
        const latency = await watchTower.latencies(snapshot);
        console.log('Got latencies', latency);

        console.log('Getting availability from watchtower metrics');
        const availability = await watchTower.calculateAvailability(
            snapshot,
            uptimeRobotUrl,
            uptimeRobotApiKey,
            uptimeRobotMonitorId
        );
        console.log('Got availability', availability);

        return exportToS3({
            health: healthResult,
            lastSpotTermination,
            cpuMetrics,
            instances,
            latency,
            availability,
        });
    } catch (err) {
        console.log('Failed to generate Dashboard', err);
        throw err;
    }
};