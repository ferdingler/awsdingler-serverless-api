const AWS = require('aws-sdk');
const stepFunctions = new AWS.StepFunctions();

exports.startExecution = async (s3Event) => {
    const stateMachineArn = process.env["IMAGE_PROCESSING_WORKFLOW_ARN"];
    console.log('Starting execution of state machine=', stateMachineArn);
    await stepFunctions.startExecution({
        stateMachineArn: stateMachineArn,
        name: s3Event.object.key,
        input: JSON.stringify({
            s3Bucket: s3Event.bucket.name,
            s3Key: s3Event.object.key
        }),
    }).promise();
    console.log('Execution started');
    return true;
};