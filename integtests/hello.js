const axios = require('axios');
const aws = require('aws-sdk');
const helloLambdaEndpoint = process.env['HELLO_LAMBDA_ENDPOINT'];

exports.handler = async (event) => {
    console.log('Event=', event);
    const codepipeline = new AWS.CodePipeline();
    const codePipelineJob = event["CodePipeline.job"];

    if(!codePipelineJob) {
        return true;
    }

    try {
        const ret = await axios(helloLambdaEndpoint);
        console.log('Successful response', ret);
        return codepipeline.putJobSuccessResult({ jobId: codePipelineJob.id }).promise();
    } catch (err) {
        console.log('Hello Lambda failed', err);
        return codepipeline.putJobFailureResult({ jobId: codePipelineJob.id }).promise();
    }
};