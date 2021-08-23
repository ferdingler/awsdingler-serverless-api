const hello = require('../hello');
const k8s = require('../k8s');
const { withMetrics } = require("../metrics");

/**
 * Invoked by API Gateway on GET /hello
 */
exports.helloWorld = withMetrics(async (event) => {
    console.log('Event=', event);
    console.log('Environment variables=', JSON.stringify(process.env));
    try {
        const msg = await hello.sayHello("World");
        await hello.queueHello(msg);
        response = buildResponse(200, msg);
    } catch (err) {
        console.error('Got error=', err);
        response = buildResponse(500, err);
    }
    return response;
});

/**
 * Invoked by SQS
 */
exports.helloProcessor = async(event) => {
    console.log('Event=', JSON.stringify(event));
    console.log('Environment variables=', JSON.stringify(process.env));
    try {
        const promises = event.Records.map(message => hello.saveHelloMessage(message));
        await Promise.all(promises);
    } catch (err) {
        console.error('Got error=', err);
        throw err;
    }
    console.log('Messages processed');
    return true;
};

/**
 * Invoked by CloudWatch Events on rate(5 min)
 */
exports.k8sDashboard = async (event) => {
    console.log('Event=', event);
    console.log('Environment variables=', JSON.stringify(process.env));
    try {
        await k8s.generateDashboardToS3();
        console.log('Dashboard generated');
    } catch (err) {
        console.error('Got error=', err);
    }
    return true;
};

const buildResponse = (statusCode, body) => {
    return {
        'statusCode': statusCode,
        'body': JSON.stringify(body),
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache,no-store'
        },
    };
};