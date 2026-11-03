require("dotenv").config();

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

const dynamodb = new AWS.DynamoDB();

const params = {

    TableName: "subscriptions",


    KeySchema: [
        {
            AttributeName: "PK",
            KeyType: "HASH"
        },
        {
            AttributeName: "SK",
            KeyType: "RANGE"
        }
    ],

    AttributeDefinitions: [
        {
            AttributeName: "PK",
            AttributeType: "S"
        },
        {
            AttributeName: "SK",
            AttributeType: "S"
        }
    ],

    BillingMode: "PAY_PER_REQUEST"
};

async function createTable() {

    try {

        const tables = await dynamodb.listTables().promise();

        if (tables.TableNames.includes("subscriptions")) {

            console.log("Subscriptions table already exists");
            return;
        }

        await dynamodb.createTable(params).promise();

        console.log("Subscriptions table created successfully");

    } catch (err) {

        console.error("Error creating table:");
        console.error(err);

    }
}

createTable();