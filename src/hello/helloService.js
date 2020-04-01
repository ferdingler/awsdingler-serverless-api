/**
 * X-ray tracing http calls
 */
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.setContextMissingStrategy("LOG_ERROR");
/**
 * Import other libraries
 */
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const axios = require('axios');

const documentClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env['HELLO_DYNAMO_TABLE'];

exports.sayHello = async () => {
    const url = 'http://checkip.amazonaws.com/';
    const ret = await axios(url);
    const ip = ret.data.trim();
    const message = {
        message: 'Hello World',
        location: ip,
    };
    return message;
};

/**
 * Receives a helloMsg from SQS with the following format
 * {
        "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
        "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
        "body": "{\"message\":\"Hello World\",\"location\":\"34.211.55.231\"}",
        "attributes": {
            "ApproximateReceiveCount": "1",
            "SentTimestamp": "1545082649183",
            "SenderId": "AIDAIENQZJOLO23YVJ4VO",
            "ApproximateFirstReceiveTimestamp": "1545082649185"
        },
        "messageAttributes": {},
        "md5OfBody": "e4e68fb7bd0e697a0ae8f1bb342846b3",
        "eventSource": "aws:sqs",
        "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
        "awsRegion": "us-east-2"
    },
 */
exports.saveHelloMessage = async (msg) => {
    console.log('Saving hello message to dynamodb', msg);
    const putResponse = await documentClient.put({
        TableName: tableName,
        Item: {
            id: msg.messageId,
            body: msg.body,
            receiptHandle: msg.receiptHandle,
            md5OfBody: msg.md5OfBody
        }
    }).promise();
    console.log('Response from dynamo', putResponse);
    return putResponse;
};