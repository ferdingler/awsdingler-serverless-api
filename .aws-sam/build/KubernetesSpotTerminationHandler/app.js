const axios = require('axios');
const AWS = require('aws-sdk');
const _ = require('lodash');
const url = 'http://checkip.amazonaws.com/';
let response;

const ec2 = new AWS.EC2();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const spotTerminationsTable = process.env['SPOT_TERMINATIONS_TABLE'];

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

exports.spotTerminationHandler = async (event) => {
    console.log('Event=', JSON.stringify(event));
    const details = event.detail;
    const instanceId = details['instance-id'];
    const timestamp = event.time;
    const response = await ec2.describeInstances({
        InstanceIds: [
            instanceId,
        ],
    }).promise();

    const reservation = response.Reservations[0];
    const instance = reservation.Instances[0];
    const tagFleet = _.find(instance.Tags, (tag) => tag.Key === 'aws:ec2spot:fleet-request-id');
    const tagName = _.find(instance.Tags, (tag) => tag.Key === 'Name');

    console.log('Describe instance response =', JSON.stringify(response));
    return dynamoDb.put({
        TableName: spotTerminationsTable,
        Item: {
            fleetId: tagFleet.Value || instanceId,
            timestamp: timestamp,
            instanceId: instanceId,
            name: tagName.Value,
            launchTime: String(instance.LaunchTime),
            instanceType: instance.InstanceType,
            imageId: instance.ImageId,
        }
    }).promise();
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