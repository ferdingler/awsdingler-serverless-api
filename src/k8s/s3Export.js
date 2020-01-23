const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const s3Bucket = process.env['RESULTS_S3_BUCKET'];

exports.toBucket = async (results) => {
    console.log('Uploading results to bucket = ', s3Bucket);
    const upload = await s3.upload({
        Bucket: s3Bucket,
        Key: 'latest.json',
        Body: JSON.stringify(results),
        ACL: 'public-read',
    }).promise();
    console.log('Upload Successful', upload);
    return upload;
};