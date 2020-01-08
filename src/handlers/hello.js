const hello = require('../hello');
const utils = require('./buildResponse');
let response;

exports.handler = async (event) => {
    console.log('Event', event);
    try {
        const helloMessage = await hello.sayHello();
        response = utils.buildResponse(200, helloMessage);
    } catch (err) {
        console.log('Error saying hello', err);
        response = utils.buildResponse(500, helloMessage);
    }

    return response;
};