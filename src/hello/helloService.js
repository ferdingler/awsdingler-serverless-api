/**
 * X-ray tracing http calls
 */
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.setContextMissingStrategy("LOG_ERROR");
/**
 * Import libraries
 */
const axios = require('axios');

exports.sayHello = async () => {
    const url = 'http://checkip.amazonaws.com/';
    const ret = await axios(url);
    const ip = ret.data.trim();
    const message = {
        message: 'Hello World',
        location: ip,
    };
    return message;
};