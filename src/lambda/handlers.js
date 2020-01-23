const hello = require('../hello');

exports.helloWorld = async (event) => {
    console.log('Event=', event);
    try {
        console.log(hello);
        const msg = await hello.sayHello();
        response = buildResponse(200, msg);
    } catch (err) {
        console.log('Got error=', err);
        response = buildResponse(500, err);
    }
    return response;
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