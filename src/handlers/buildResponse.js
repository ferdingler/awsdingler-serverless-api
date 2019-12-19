const buildResponse = (statusCode, body) => {
    return {
        'statusCode': statusCode,
        'body': JSON.stringify(body),
        'headers': {
            'Access-Control-Allow-Origin': '*',
        },
    };
};

exports.default = buildResponse;