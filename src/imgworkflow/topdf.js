const fs = require('fs');
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

exports.imageToPdf = async (state) => {
    console.log('State machine state', state);
    const s3Key = state.s3Key;
    const s3Bucket = state.s3Bucket;

    console.log('Downloading image from S3', s3Key);
    const object = await S3.getObject({
        Bucket: s3Bucket,
        Key: s3Key,
    }).promise();

    // Save file to local lambda temp storage
    console.log('Saving file to local folder');
    const localImage = '/tmp/'.concat(s3Key);
    fs.writeFileSync(localImage, object.Body);
    console.log('Saved file successfully');

    // Convert to pdf
    console.log('Converting to PDF');
    const localPdf = '/tmp/'.concat(s3Key.concat('.pdf'));
    // await imagesToPdf([localImage], localPdf);
    console.log('Converted to PDF successfully', localPdf);

    // Upload pdf to s3
    console.log('Reading PDF from disk');
    // const pdf = fs.readFileSync(localPdf);
    // const pdf = fs.readFileSync(localImage);
    const s3KeyPdf = s3Key.concat('.pdf');
    console.log('Uploading to S3');
    await S3.upload({
        Bucket: s3Bucket,
        Key: s3KeyPdf,
        Body: object.Body,
    });

    console.log('PDF uploaded to S3 successfully', s3KeyPdf);
    return {
        ...state,
        imageToPdf: { s3Key: s3KeyPdf },
    };
};