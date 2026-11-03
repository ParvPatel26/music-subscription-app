require("dotenv").config();

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

const dynamodb = new AWS.DynamoDB();

const params = {

    TableName: "music",

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
        },

        {
            AttributeName: "album_title",
            AttributeType: "S"
        },

        {
            AttributeName: "title",
            AttributeType: "S"
        },
        {
            AttributeName: "artist_album_key",
            AttributeType: "S"
        },

        {
            AttributeName: "year",
            AttributeType: "S"
        },
        {
            AttributeName: "artist_title_album",
            AttributeType: "S"
        }
    ],


    LocalSecondaryIndexes: [
        {
            IndexName: "album-index",

            KeySchema: [
                {
                    AttributeName: "PK",
                    KeyType: "HASH"
                },
                {
                    AttributeName: "album_title",
                    KeyType: "RANGE"
                }
            ],

            Projection: {
                ProjectionType: "ALL"
            }
        }
    ],


    GlobalSecondaryIndexes: [
        {
            IndexName: "title-index",

            KeySchema: [
                {
                    AttributeName: "title",
                    KeyType: "HASH"
                },
                {
                    AttributeName: "artist_album_key",
                    KeyType: "RANGE"
                }
            ],

            Projection: {
                ProjectionType: "ALL"
            }
        },

        {
            IndexName: "year-index",

            KeySchema: [
                {
                    AttributeName: "year",
                    KeyType: "HASH"
                },
                {
                    AttributeName: "artist_title_album",
                    KeyType: "RANGE"
                }
            ],

            Projection: {
                ProjectionType: "ALL"
            }
        }
    ],

    BillingMode: "PAY_PER_REQUEST"
};

async function createTable() {

    try {

        const tables = await dynamodb.listTables().promise();

        if (tables.TableNames.includes("music")) {

            console.log("Music table already exists");
            return;
        }

        await dynamodb.createTable(params).promise();

        console.log("Music table created successfully");

    } catch (err) {

        console.error("Error creating table:");
        console.error(err);

    }
}

createTable();