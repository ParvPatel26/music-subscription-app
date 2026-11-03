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

                const password =
                    body.password;


                if (
                    !email ||
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


                const PK =
                    `USER#${email}`;

                const user =
                    await dynamo.get({

                        TableName: TABLE,

                        Key: {
                            PK
                        }

                    }).promise();


                if (!user.Item) {

                    return {

                        statusCode: 401,

                        headers: {
                            "Access-Control-Allow-Origin":
                                "*"
                        },

                        body: JSON.stringify({
                            message:
                                "Email or password is invalid"
                        })
                    };
                }



                const isMatch =
                    await bcrypt.compare(

                        password,

                        user.Item.password
                    );

                if (!isMatch) {

                    return {

                        statusCode: 401,

                        headers: {
                            "Access-Control-Allow-Origin":
                                "*"
                        },

                        body: JSON.stringify({
                            message:
                                "Email or password is invalid"
                        })
                    };
                }


                return {

                    statusCode: 200,

                    headers: {
                        "Access-Control-Allow-Origin":
                            "*"
                    },

                    body: JSON.stringify({

                        username:
                            user.Item.username,

                        email:
                            user.Item.email
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