const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_REGION });

const dynamo = new AWS.DynamoDB.DocumentClient();

module.exports = dynamo;