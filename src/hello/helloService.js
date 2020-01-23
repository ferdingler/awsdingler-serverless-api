const axios = require('axios');
const url = 'http://checkip.amazonaws.com/';

exports.sayHello = async () => {
    const ret = await axios(url);
    const ip = ret.data.trim();
    const message = {
        message: 'Hello World',
        location: ip,
    };
    return message;
};