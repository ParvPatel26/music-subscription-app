const AWS = require("aws-sdk");

const dynamo =
    new AWS.DynamoDB.DocumentClient();

const TABLE = "subscriptions";

const AUTH_TABLE = "auth";

exports.handler = async (event) => {

    try {

        const email =
            event.pathParameters.email
                ?.trim()
                .toLowerCase();

        if (!email) {

            return {

                statusCode: 400,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                    "Email is required"
                })
            };
        }

        const userPK =
            `USER#${email}`;

        const user =
            await dynamo.get({

                TableName: AUTH_TABLE,

                Key: {
                    PK: userPK
                }

            }).promise();

        if (!user.Item) {

            return {

                statusCode: 404,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                    "User not found"
                })
            };
        }

        const data =
            await dynamo.query({

                TableName: TABLE,

                KeyConditionExpression:
                    "PK = :pk",

                ExpressionAttributeValues: {
                    ":pk": userPK
                }

            }).promise();

        if (
            !data.Items ||
            data.Items.length === 0
        ) {

            return {

                statusCode: 200,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                    "No subscriptions found",
                    subscriptions: []
                })
            };
        }

        return {

            statusCode: 200,

            headers: {
                "Access-Control-Allow-Origin":
                    "*"
            },

            body: JSON.stringify(
                data.Items
            )
        };

    } catch (err) {

        console.error(err);

        return {

            statusCode: 500,

            headers: {
                "Access-Control-Allow-Origin":
                    "*"
            },

            body: JSON.stringify({
                message:
                    "Error fetching subscriptions"
            })
        };
    }
};