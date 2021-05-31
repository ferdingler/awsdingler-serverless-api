const AWSXRay = require('aws-xray-sdk');
AWSXRay.setContextMissingStrategy("LOG_ERROR");

// Configure context missing strategy when running on lambda
if (process.env['AWS_XRAY_CONTEXT_MISSING']) {
    AWSXRay.captureHTTPsGlobal(require('http'));
}

/**
 * Import other libraries
 */
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const axios = require('axios');
const moment = require('moment');
const { Unit } = require("aws-embedded-metrics");
const { LambdaMetrics } = require("../metrics");

const documentClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env['HELLO_DYNAMO_TABLE'];
axios.defaults.timeout = 5000;

exports.sayHello = async (name) => {

    LambdaMetrics.putDimensions({ Operation: "SayHello" });
    LambdaMetrics.putMetric("Count", 1.0, Unit.Count);

    try {
        const url = 'http://checkip.amazonaws.com/';
        console.info('Ping to checkip.amazonaws.com');
        const ret = await axios.get(url, { timeout: 5000 });
        const ip = ret.data.trim();
        console.info('Response from checkip.amazonaws.com =', ip);
        const message = { message: `Hello ${name}`, location: ip };

        LambdaMetrics.putMetric("Success", 1.0, Unit.Count);
        return message;
    } catch (err) {
        LambdaMetrics.putMetric("Error", 1.0, Unit.Count);
        console.error('Error on request to checkip.amazonaws.com', err.message);
        throw err;
    }
}

/**
 * Receives a msg from SQS and saves it into DynamoDB.
 * The format of the msg is the standard SQS Event Input.
 */
exports.saveHelloMessage = async (msg) => {
    console.log('Saving hello message to dynamodb', msg);
    const expiration = moment().add(7, 'days');
    const putResponse = await documentClient.put({
        TableName: tableName,
        Item: {
            messageId: msg.messageId,
            body: msg.body,
            receiptHandle: msg.receiptHandle,
            md5OfBody: msg.md5OfBody,
            timestamp: parseInt(msg.attributes['SentTimestamp']),
            expirationTime: expiration.unix()
        }
    }).promise();
    console.log('Response from dynamo', putResponse);
    return putResponse;
};

