const AWSXRay = require('aws-xray-sdk');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const sqs = new AWS.SQS();

const queueUrl = process.env['HELLO_QUEUE_URL'];

/**
 * Given a hello world message, it saves it
 * in an SQS queue for further processing.
 */
exports.queueHelloMessage = async (helloMessage) => {
    console.log('Queueing hello message', helloMessage);
    const response = await sqs.sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(helloMessage),
    }).promise();
    console.log('Got response from sqs', response);
};