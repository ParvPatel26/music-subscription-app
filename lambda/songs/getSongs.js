const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = "music";

const CORS = { "Access-Control-Allow-Origin": "*" };

const ok  = (body, code = 200) => ({
    statusCode: code,
    headers: CORS,
    body: JSON.stringify(body)
});

const err = (msg, code = 400) => ({
    statusCode: code,
    headers: CORS,
    body: JSON.stringify({ message: msg })
});

exports.handler = async (event) => {
    try {
        const q = event.queryStringParameters || {};

        const artist = (q.artist || '').trim();
        const album  = (q.album  || '').trim();
        const title  = (q.title  || '').trim();
        const year   = (q.year   || '').trim();

        if (!artist && !album && !title && !year) {
            return err("At least one field required", 400);
        }

        let items = [];

        if (artist && !album && !title && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": `ARTIST#${artist}`
                }
            }).promise();
            items = data.Items || [];
        }

    
        else if (title && !artist && !album && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "title-index",
                KeyConditionExpression: "title = :title",
                ExpressionAttributeValues: {
                    ":title": title
                }
            }).promise();
            items = data.Items || [];
        }

        else if (year && !artist && !album && !title) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "year-index",
                KeyConditionExpression: "#yr = :year",
                ExpressionAttributeNames: { "#yr": "year" },
                ExpressionAttributeValues: { ":year": year }
            }).promise();
            items = data.Items || [];
        }


        else if (album && !artist && !title && !year) {
            const data = await dynamo.scan({
                TableName: TABLE,
                FilterExpression: "contains(album, :album)",
                ExpressionAttributeValues: { ":album": album }
            }).promise();
            items = data.Items || [];
        }

        else if (artist && album && !title && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": `ARTIST#${artist}`
                }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.album &&
                x.album.toLowerCase().includes(album.toLowerCase())
            );
        }

        else if (artist && title && !album && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": `ARTIST#${artist}`
                }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.title &&
                x.title.toLowerCase().includes(title.toLowerCase())
            );
        }


        else if (artist && year && !album && !title) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "year-index",
                KeyConditionExpression: "#yr = :year",
                ExpressionAttributeNames: { "#yr": "year" },
                ExpressionAttributeValues: { ":year": year }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.artist &&
                x.artist.toLowerCase() === artist.toLowerCase()
            );
        }

        else if (title && year && !artist && !album) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "title-index",
                KeyConditionExpression: "title = :title",
                ExpressionAttributeValues: { ":title": title }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.year === year
            );
        }


        else if (title && album && !artist && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "title-index",
                KeyConditionExpression: "title = :title",
                ExpressionAttributeValues: { ":title": title }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.album &&
                x.album.toLowerCase().includes(album.toLowerCase())
            );
        }

 
        else if (year && album && !artist && !title) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "year-index",
                KeyConditionExpression: "#yr = :year",
                ExpressionAttributeNames: { "#yr": "year" },
                ExpressionAttributeValues: { ":year": year }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.album &&
                x.album.toLowerCase().includes(album.toLowerCase())
            );
        }

        else if (artist && album && year && !title) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": `ARTIST#${artist}`
                }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.album && x.album.toLowerCase().includes(album.toLowerCase()) &&
                x.year  === year
            );
        }

        else if (artist && title && year && !album) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": `ARTIST#${artist}`
                }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.title && x.title.toLowerCase().includes(title.toLowerCase()) &&
                x.year  === year
            );
        }

        else if (artist && title && album && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": `ARTIST#${artist}`
                }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.title && x.title.toLowerCase().includes(title.toLowerCase()) &&
                x.album && x.album.toLowerCase().includes(album.toLowerCase())
            );
        }

    
        else if (title && year && album && !artist) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "title-index",
                KeyConditionExpression: "title = :title",
                ExpressionAttributeValues: { ":title": title }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.year === year &&
                x.album && x.album.toLowerCase().includes(album.toLowerCase())
            );
        }

        else if (artist && title && album && year) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": `ARTIST#${artist}`
                }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.title && x.title.toLowerCase().includes(title.toLowerCase()) &&
                x.album && x.album.toLowerCase().includes(album.toLowerCase()) &&
                x.year  === year
            );
        }

        else {
            let scanParams = { TableName: TABLE };
            let filters = [];
            let values  = {};
            let names   = {};

            if (album) {
                filters.push("contains(album, :album)");
                values[":album"] = album;
            }
            if (title) {
                filters.push("contains(title, :title)");
                values[":title"] = title;
            }
            if (year) {
                filters.push("#yr = :year");
                values[":year"] = year;
                names["#yr"]    = "year";
            }
            if (artist) {
                filters.push("contains(artist, :artist)");
                values[":artist"] = artist;
            }

            if (filters.length > 0) {
                scanParams.FilterExpression          = filters.join(" AND ");
                scanParams.ExpressionAttributeValues = values;
                if (Object.keys(names).length > 0) {
                    scanParams.ExpressionAttributeNames = names;
                }
            }

            const data = await dynamo.scan(scanParams).promise();
            items = data.Items || [];
        }

        if (!items || items.length === 0) {
            return ok({
                message: "No result is retrieved. Please query again"
            });
        }

        return ok(items);

    } catch (error) {
        console.error("Lambda songs error:", error);
        return err("Error fetching songs", 500);
    }
};
