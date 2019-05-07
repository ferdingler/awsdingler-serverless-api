const AWS = require('aws-sdk');
const health = require('./k8sDashboard/health');
const spot = require('./k8sDashboard/spot');
const moment = require('moment');

const s3 = new AWS.S3();
const exportToS3 = async (results) => {
    console.log('Uploading results to S3');
    const upload = await s3.upload({
        Bucket: 'awsdingler-k8s-dashboard',
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
    let healthResult;

    try {
        console.log('Calculating health');
        healthResult = await health.readDashboardHealth(snapshot);
        console.log('Health=', healthResult);

        console.log('Calculating last spot termination');
        const lastSpotTermination = await spot.lastTermination();
        console.log('LastSpotTermination=', lastSpotTermination);

        return exportToS3({
            health: healthResult,
            lastSpotTermination: lastSpotTermination,
        });
    } catch (err) {
        console.log('Failed to generate Dashboard', err);
        throw err;
    }
};