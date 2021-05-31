const AWSXRay = require("aws-xray-sdk");
AWSXRay.setContextMissingStrategy("LOG_ERROR");

const AWS = AWSXRay.captureAWS(require("aws-sdk"));
const sqs = new AWS.SQS();

const queueUrl = process.env["HELLO_QUEUE_URL"];

/**
 * Given a hello world message, it saves it
 * in an SQS queue for further processing.
 */
exports.queueHelloMessage = async (helloMessage) => {
  console.info("Queueing hello message", helloMessage);
  try {
    const response = await sqs
      .sendMessage({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(helloMessage),
      })
      .promise();
    console.info("Response from sqs", response);
  } catch (err) {
    console.error("Error saving message to SQS", err);
    throw err;
  }
};
