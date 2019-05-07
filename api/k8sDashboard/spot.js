const AWS = require('aws-sdk');
const _ = require('lodash');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.lastTermination = async () => {
    const spotTerminationsTable = process.env['SPOT_TERMINATIONS_TABLE'];
    const spotFleetId = process.env['SPOT_FLEET_ID'];
    const terminations = await dynamoDb.query({
        TableName: spotTerminationsTable,
        KeyConditionExpression: 'fleetId = :hkey',
        ScanIndexForward: false,
        ExpressionAttributeValues: {
            ':hkey': spotFleetId,
        }
    }).promise();

    if (_.isEmpty(terminations.Items)) {
        throw new Error('Nothing found on DynamoDB table');
    }

    return terminations.Items[0];
};