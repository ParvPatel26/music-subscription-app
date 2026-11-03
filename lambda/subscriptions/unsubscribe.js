const AWS = require("aws-sdk");

const dynamo =
    new AWS.DynamoDB.DocumentClient();

const TABLE = "subscriptions";

const AUTH_TABLE = "auth";

exports.handler = async (event) => {

    try {

        const body =
            JSON.parse(event.body);

        const email =
            body.email?.trim().toLowerCase();

        const title =
            body.title?.trim();

        const album =
            body.album?.trim();

        if (
            !email ||
            !title ||
            !album
        ) {

            return {

                statusCode: 400,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                        "Email, title and album are required"
                })
            };
        }

        const userPK =
            `USER#${email}`;

        const songSK =
            `SONG#${title}#${album}`;

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

        const subscription =
            await dynamo.get({

                TableName: TABLE,

                Key: {
                    PK: userPK,
                    SK: songSK
                }

            }).promise();

        if (!subscription.Item) {

            return {

                statusCode: 404,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                        "Subscription not found"
                })
            };
        }

        await dynamo.delete({

            TableName: TABLE,

            Key: {
                PK: userPK,
                SK: songSK
            }

        }).promise();

        return {

            statusCode: 200,

            headers: {
                "Access-Control-Allow-Origin":
                    "*"
            },

            body: JSON.stringify({
                message:
                    "Unsubscribed successfully"
            })
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
                    "Error unsubscribing"
            })
        };
    }
};