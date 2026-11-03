const express = require('express');

const router = express.Router();

const dynamo = require('../services/dynamo');

const TABLE = process.env.SUB_TABLE;

const AUTH_TABLE = process.env.LOGIN_TABLE;


router.post('/', async (req, res) => {

    const email =
        req.body.email?.trim().toLowerCase();

    const title =
        req.body.title?.trim();

    const artist =
        req.body.artist?.trim();

    const album =
        req.body.album?.trim();

    const year =
        req.body.year?.toString().trim();

    const image_url =
        req.body.image_url?.trim();

    if (
        !email ||
        !title ||
        !artist ||
        !album ||
        !year
    ) {

        return res.status(400).json({
            message: "Missing required fields"
        });
    }

    try {

        const userPK =
            `USER#${email}`;

        const songSK =
            `SONG#${title}#${album}`;

        const user = await dynamo.get({

            TableName: AUTH_TABLE,

            Key: {
                PK: userPK
            }

        }).promise();

        if (!user.Item) {

            return res.status(404).json({
                message: "User not found"
            });
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

            return res.status(400).json({
                message:
                    "Already subscribed"
            });
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

        res.json({
            message:
                "Subscribed successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message:
                "Error subscribing"
        });
    }
});

router.delete('/', async (req, res) => {

    const email =
        req.body.email?.trim().toLowerCase();

    const title =
        req.body.title?.trim();

    const album =
        req.body.album?.trim();

    if (!email || !title || !album) {

        return res.status(400).json({
            message:
                "Missing required fields"
        });
    }

    try {

        const userPK =
            `USER#${email}`;

        const songSK =
            `SONG#${title}#${album}`;

        const existingSub =
            await dynamo.get({

                TableName: TABLE,

                Key: {
                    PK: userPK,
                    SK: songSK
                }

            }).promise();

        if (!existingSub.Item) {

            return res.status(404).json({
                message:
                    "Subscription not found"
            });
        }

        await dynamo.delete({

            TableName: TABLE,

            Key: {
                PK: userPK,
                SK: songSK
            }

        }).promise();

        res.json({
            message:
                "Removed successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message:
                "Error removing subscription"
        });
    }
});

router.get('/:email', async (req, res) => {

    const email =
        req.params.email?.trim().toLowerCase();

    if (!email) {

        return res.status(400).json({
            message:
                "Email is required"
        });
    }

    try {

        const userPK =
            `USER#${email}`;

        const user = await dynamo.get({

            TableName: AUTH_TABLE,

            Key: {
                PK: userPK
            }

        }).promise();

        if (!user.Item) {

            return res.status(404).json({
                message:
                    "User not found"
            });
        }

        const data = await dynamo.query({

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

            return res.json({
                message:
                    "No subscriptions found",
                subscriptions: []
            });
        }

        res.json(data.Items);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message:
                "Error fetching subscriptions"
        });
    }
});

module.exports = router;