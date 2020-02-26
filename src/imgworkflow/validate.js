const AWS = require('aws-sdk');
const S3 = new AWS.S3();

exports.validateImage = async (state) => {
    console.log('State machine state', state);
    const s3Key = state.s3Key;
    const s3Bucket = state.s3Bucket;

    console.log('Downloading image from S3', s3Key);
    const metadata = await S3.headObject({
        Bucket: s3Bucket,
        Key: s3Key,
    }).promise();

    console.log('Object', metadata);
    const contentType = metadata.ContentType;
    const size = metadata.ContentLength;

    const validTypes = ['image/png', 'image/jpeg'];
    if(!validTypes.includes(contentType)) {
        console.log('Invalid content type', contentType);
        throw new InvalidImageException("Invalid content type".concat(contentType));
    }

    if(size <= 0) {
        console.log('Image size is zero');
        throw new InvalidImageException("Invalid image size".concat(size));
    }

    // Append new values to current state and returns
    return {
        ...state,
        validateImage: {
            isValid: true,
        }
    };
};

function InvalidImageException(message) {
    this.name = "InvalidContentTypeException";
    this.message = message;
}

InvalidImageException.prototype = new Error();