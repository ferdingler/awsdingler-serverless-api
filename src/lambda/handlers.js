const hello = require('../hello');
const k8s = require('../k8s');
const imgworkflow = require('../imgworkflow');

exports.helloWorld = async (event) => {
    console.log('Event=', event);
    try {
        const msg = await hello.sayHello();
        response = buildResponse(200, msg);
    } catch (err) {
        console.log('Got error=', err);
        response = buildResponse(500, err);
    }
    return response;
};

exports.k8sDashboard = async (event) => {
    console.log('Event=', event);
    try {
        await k8s.generateDashboardToS3();
    } catch (err) {
        console.log('Got error=', err);
    }
    return true;
};

/**
 * State machine functions
 */
exports.validateImage = async (state) => {
    console.log('State=', JSON.stringify(state));
    return imgworkflow.validateImage(state);
};

exports.imageToPdf = async (state) => {
    console.log('State=', JSON.stringify(state));
    return imgworkflow.imageToPdf(state);
};

exports.startImageProcessingWorkflow = async (event) => {
    console.log('Event=', JSON.stringify(event));
    if (event.Records) {
        // https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html
        const s3Event = event.Records[0].s3;
        return imgworkflow.startExecution(s3Event);
    }
};

const buildResponse = (statusCode, body) => {
    return {
        'statusCode': statusCode,
        'body': JSON.stringify(body),
        'headers': {
            'Access-Control-Allow-Origin': '*',
        },
    };
};