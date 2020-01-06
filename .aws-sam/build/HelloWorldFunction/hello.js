const hello = require('../hello');
const buildResponse = require('./buildResponse');
let response;

exports.handler = async (event) => {
    console.log('Event', event);
    try {
        const helloMessage = await hello.sayHello();
        response = buildResponse(200, helloMessage);
    } catch (err) {
        console.log('Error saying hello', err);
        response = buildResponse(500, helloMessage);
    }

    return response;
};