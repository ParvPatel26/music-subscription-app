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

        const artist =
            body.artist?.trim();

        const album =
            body.album?.trim();

        const year =
            body.year?.toString().trim();

        const image_url =
            body.image_url?.trim();

        if (
            !email ||
            !title ||
            !artist ||
            !album ||
            !year
        ) {

            return {

                statusCode: 400,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                        "Missing required fields"
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

        const existingSub =
            await dynamo.get({

                TableName: TABLE,

                Key: {
                    PK: userPK,
                    SK: songSK
                }

            }).promise();

        if (existingSub.Item) {

            return {

                statusCode: 400,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                        "Already subscribed"
                })
            };
        }

        await dynamo.put({

            TableName: TABLE,

            Item: {

                PK: userPK,
                SK: songSK,

                email,

                title,
                artist,
                album,
                year,

                image_url,

                subscribed_at:
                    new Date().toISOString()
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
                    "Subscribed successfully"
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
                    "Error subscribing"
            })
        };
    }
};