require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

const dynamodb     = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "auth";

const tableParams = {
    TableName: TABLE_NAME,
    KeySchema: [
        {
            AttributeName: "PK",
            KeyType:       "HASH"
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

const USERS = [
    {
        PK:        "USER#s3801@student.rmit.edu.au",
        email:     "s3801@student.rmit.edu.au",
        user_name: "Alice",
        password:  "Alice_2025"
    },
    {
        PK:        "USER#s3802@student.rmit.edu.au",
        email:     "s3802@student.rmit.edu.au",
        user_name: "Bob",
        password:  "Bob_2025"
    },
    {
        PK:        "USER#s3803@student.rmit.edu.au",
        email:     "s3803@student.rmit.edu.au",
        user_name: "Carol",
        password:  "Carol_2025"
    },
    {
        PK:        "USER#s3804@student.rmit.edu.au",
        email:     "s3804@student.rmit.edu.au",
        user_name: "Dave",
        password:  "Dave_2025"
    },
    {
        PK:        "USER#s3805@student.rmit.edu.au",
        email:     "s3805@student.rmit.edu.au",
        user_name: "Eve",
        password:  "Eve_2025"
    },
    {
        PK:        "USER#s3806@student.rmit.edu.au",
        email:     "s3806@student.rmit.edu.au",
        user_name: "Frank",
        password:  "Frank_2025"
    },
    {
        PK:        "USER#s3807@student.rmit.edu.au",
        email:     "s3807@student.rmit.edu.au",
        user_name: "Grace",
        password:  "Grace_2025"
    },
    {
        PK:        "USER#s3808@student.rmit.edu.au",
        email:     "s3808@student.rmit.edu.au",
        user_name: "Hank",
        password:  "Hank_2025"
    },
    {
        PK:        "USER#s3809@student.rmit.edu.au",
        email:     "s3809@student.rmit.edu.au",
        user_name: "Ivy",
        password:  "Ivy_2025"
    },
    {
        PK:        "USER#s3810@student.rmit.edu.au",
        email:     "s3810@student.rmit.edu.au",
        user_name: "Jack",
        password:  "Jack_2025"
    }
];


async function createTable() {
    try {
        const tables = await dynamodb.listTables().promise();

        if (tables.TableNames.includes(TABLE_NAME)) {
            console.log(`Auth table already exists.`);
            return;
        }

        await dynamodb.createTable(tableParams).promise();
        console.log("Auth table created successfully.");

        console.log("Waiting for table to become ACTIVE...");
        await dynamodb.waitFor("tableExists", {
            TableName: TABLE_NAME
        }).promise();
        console.log("Auth table is now ACTIVE.");

    } catch (err) {
        console.error("Error creating table:", err);
        throw err;
    }
}


async function loadUsers() {
    console.log(`\nLoading ${USERS.length} users into '${TABLE_NAME}' table...`);

    const putRequests = USERS.map(user => ({
        PutRequest: {
            Item: user
        }
    }));

    const params = {
        RequestItems: {
            [TABLE_NAME]: putRequests
        }
    };

    try {
        await documentClient.batchWrite(params).promise();
        console.log(`Successfully loaded ${USERS.length} users.`);

        USERS.forEach(user => {
            console.log(`  Added: ${user.email} (${user.user_name})`);
        });

    } catch (err) {
        console.error("Error loading users:", err);
        throw err;
    }
}


async function verifyUsers() {
    console.log("\nVerifying users in table...");

    try {
        const result = await documentClient.scan({
            TableName: TABLE_NAME,
            Select:    "COUNT"
        }).promise();

        console.log(`Total users in '${TABLE_NAME}': ${result.Count}`);

        if (result.Count === USERS.length) {
            console.log("All users loaded successfully!");
        } else {
            console.log(`Warning: Expected ${USERS.length}, found ${result.Count}.`);
        }
    } catch (err) {
        console.error("Error verifying users:", err);
    }
}


async function main() {
    console.log("=".repeat(50));
    console.log("Create Auth Table + Load 10 Users");
    console.log("=".repeat(50));

    await createTable();
    await loadUsers();
    await verifyUsers();

    console.log("\nDone!");
    console.log("\nTest login credentials:");
    console.log("  Email   : s3801@student.rmit.edu.au");
    console.log("  Password: Alice_2025");
}

main().catch(console.error);
