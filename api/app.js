const axios = require('axios');
const algo = require('/opt/algo');
const url = 'http://checkip.amazonaws.com/';
let response;

exports.hello = async (event, context) => {
    console.log('Event', event);
    try {
        const ret = await axios(url);
        console.log(algo);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Hello World',
                location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
