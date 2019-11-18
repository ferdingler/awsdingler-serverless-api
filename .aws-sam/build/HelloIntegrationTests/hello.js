const axios = require('axios');
const helloLambdaEndpoint = process.env['HELLO_LAMBDA_ENDPOINT'];

exports.handler = async (event) => {
    console.log('Event=', event);
    try {
        const ret = await axios(helloLambdaEndpoint);
        console.log('Successful response', ret.data.trim());
        return true;
    } catch (err) {
        console.log('Hello Lambda failed', err);
        throw err;
    }
};