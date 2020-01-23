const axios = require('axios');
const common = require('/opt/nodejs/algo');
const url = 'http://checkip.amazonaws.com/';

exports.sayHello = async () => {
    console.log('Layer = ', common);
    const ret = await axios(url);
    const ip = ret.data.trim();
    const message = {
        message: 'Hello World',
        location: ip,
    };
    return message;
};