const AWS = require("aws-sdk");

const bcrypt = require("bcryptjs");

const dynamo =
    new AWS.DynamoDB.DocumentClient();

const TABLE = "auth";

exports.handler = async (event) => {

    try {



        const body =
            JSON.parse(event.body);

        const email =
            body.email?.trim().toLowerCase();

        const username =
            body.username?.trim();

        const password =
            body.password;


        if (
            !email ||
            !username ||
            !password
        ) {

            return {

                statusCode: 400,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                        "All fields required"
                })
            };
        }


        if (
            password.length < 6
        ) {

            return {

                statusCode: 400,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                        "Password must be at least 6 characters"
                })
            };
        }

        const PK =
            `USER#${email}`;

        const existing =
            await dynamo.get({

                TableName: TABLE,

                Key: {
                    PK
                }

            }).promise();

        if (existing.Item) {

            return {

                statusCode: 400,

                headers: {
                    "Access-Control-Allow-Origin":
                        "*"
                },

                body: JSON.stringify({
                    message:
                        "The email already exists"
                })
            };
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        await dynamo.put({

            TableName: TABLE,

            Item: {

                PK,

                email,

                username,

                password:
                    hashedPassword
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
                    "Registered successfully"
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
                    "Server error"
            })
        };
    }
};