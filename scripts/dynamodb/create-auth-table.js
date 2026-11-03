require("dotenv").config();

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

const dynamodb = new AWS.DynamoDB();

const params = {

    TableName: "auth",

    KeySchema: [
        {
            AttributeName: "PK",
            KeyType: "HASH"
        }
    ],

    AttributeDefinitions: [
        {
            AttributeName: "PK",
            AttributeType: "S"
        }
    ],

    BillingMode: "PAY_PER_REQUEST"
};

async function createTable() {

    try {

        const tables = await dynamodb.listTables().promise();

        if (tables.TableNames.includes("auth")) {

            console.log("Auth table already exists");
            return;
        }

        await dynamodb.createTable(params).promise();

        console.log("Auth table created successfully");

    } catch (err) {

        console.error("Error creating table:");
        console.error(err);

    }
}

createTable();