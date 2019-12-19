const axios = require('axios');
const url = 'http://checkip.amazonaws.com/';

exports.sayHello = () => {
    const ret = await axios(url);
    const ip = ret.data.trim();
    const message = 'Hello buddy: ';
    return message.concat(ip);
};