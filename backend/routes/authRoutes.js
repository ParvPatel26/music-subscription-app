const express = require('express');

const router = express.Router();

const bcrypt = require('bcryptjs');

const dynamo = require('../services/dynamo');

const TABLE = process.env.LOGIN_TABLE;


router.post('/register', async (req, res) => {

    const email =
        req.body.email?.trim().toLowerCase();

    const username =
        req.body.username?.trim();

    const password =
        req.body.password;

    if (!email || !username || !password) {

        return res.status(400).json({
            message: "All fields required"
        });
    }

    if (password.length < 6) {

        return res.status(400).json({
            message:
            "Password must be at least 6 characters"
        });
    }

    try {

        const PK = `USER#${email}`;

        const existing = await dynamo.get({

            TableName: TABLE,

            Key: { PK }

        }).promise();

        if (existing.Item) {

            return res.status(400).json({
                message:
                "The email already exists"
            });
        }


        const hashedPassword =
            await bcrypt.hash(password, 10);

        await dynamo.put({

            TableName: TABLE,

            Item: {

                PK,

                email,
                username,

                password: hashedPassword
            }

        }).promise();

        res.status(200).json({
            message: "Registered successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error"
        });
    }
});


router.post('/login', async (req, res) => {


    const email =
        req.body.email?.trim().toLowerCase();

    const password =
        req.body.password;


    if (!email || !password) {

        return res.status(400).json({
            message: "All fields required"
        });
    }

    try {

        const PK = `USER#${email}`;

        const user = await dynamo.get({

            TableName: TABLE,

            Key: { PK }

        }).promise();

        if (!user.Item) {

            return res.status(401).json({
                message:
                "Email or password is invalid"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.Item.password
            );

        if (!isMatch) {

            return res.status(401).json({
                message:
                "Email or password is invalid"
            });
        }
      res.json({

            username: user.Item.username,

            email: user.Item.email
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;