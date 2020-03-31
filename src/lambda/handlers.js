const hello = require('../hello');
const k8s = require('../k8s');

exports.helloWorld = async (event) => {
    console.log('Event=', event);
    try {
        const msg = await hello.sayHello();
        await hello.queueHello(msg);
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

const buildResponse = (statusCode, body) => {
    return {
        'statusCode': statusCode,
        'body': JSON.stringify(body),
        'headers': {
            'Access-Control-Allow-Origin': '*',
        },
    };
};