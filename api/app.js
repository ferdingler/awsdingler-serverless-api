const axios = require('axios');
const url = 'http://checkip.amazonaws.com/';
let response;

exports.hello = async (event, context) => {
    console.log('Event', event);
    try {
        const ret = await axios(url);
        response = buildResponse(200, {
            message: 'Today is Friday, November 22nd, 2019',
            location: ret.data.trim(),
        });
    } catch (err) {
        console.log(err);
        return err;
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