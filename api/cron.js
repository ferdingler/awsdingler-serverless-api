const AWS = require('aws-sdk');
const health = require('./k8sDashboard/health');
const spot = require('./k8sDashboard/spot');
const moment = require('moment');

const s3Bucket = process.env['RESULTS_S3_BUCKET'];
const spotTerminationsTable = process.env['SPOT_TERMINATIONS_TABLE'];
const spotFleetId = process.env['SPOT_FLEET_ID'];

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
    console.log('Snapshot', snapshot.toISOString());
    console.log('SpotTerminationsTable', spotTerminationsTable);
    console.log('SpotFleetId', spotFleetId);
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

        return exportToS3({
            health: healthResult,
            lastSpotTermination,
            cpuMetrics,
            instances,
        });
    } catch (err) {
        console.log('Failed to generate Dashboard', err);
        throw err;
    }
};