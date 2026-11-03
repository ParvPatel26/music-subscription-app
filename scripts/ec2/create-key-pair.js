
require("dotenv").config();

const AWS = require("aws-sdk");

const fs = require("fs");

AWS.config.update({
    region: process.env.AWS_REGION
});

const ec2 = new AWS.EC2();

const KEY_NAME = "music-key";

async function createKeyPair() {

    try {

        const existing =
            await ec2.describeKeyPairs({
                KeyNames: [KEY_NAME]
            }).promise()
            .catch(() => null);

        if (existing) {

            console.log(
                "Key pair already exists"
            );

            return;
        }

        const key =
            await ec2.createKeyPair({

                KeyName: KEY_NAME

            }).promise();


        fs.writeFileSync(

            `${KEY_NAME}.pem`,

            key.KeyMaterial,

            {
                mode: 0o400
            }
        );

        console.log(
            `Key pair created: ${KEY_NAME}`
        );

        console.log(
            `Saved: ${KEY_NAME}.pem`
        );

        console.log(
            "\nIMPORTANT:"
        );

        console.log(
            "Do NOT upload PEM file to GitHub."
        );

    } catch (err) {

        console.error("Error:");
        console.error(err);
    }
}

createKeyPair();