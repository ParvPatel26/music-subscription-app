const express = require('express');
const router = express.Router();
const dynamo = require('../services/dynamo');
const TABLE = process.env.MUSIC_TABLE;

router.get('/', async (req, res) => {

    const artist = (req.query.artist || '').trim();
    const album  = (req.query.album  || '').trim();
    const title  = (req.query.title  || '').trim();
    const year   = (req.query.year   || '').trim();

    if (!artist && !album && !title && !year) {
        return res.status(400).json({
            message: "At least one field required"
        });
    }

    try {
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

        else if (artist && album && !title && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "album-index",
                KeyConditionExpression:
                    "PK = :pk AND begins_with(album_title, :album)",
                ExpressionAttributeValues: {
                    ":pk":    `ARTIST#${artist}`,
                    ":album": album
                }
            }).promise();
            items = data.Items || [];
        }

        else if (artist && title && !album && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression:
                    "PK = :pk AND begins_with(SK, :title)",
                ExpressionAttributeValues: {
                    ":pk":    `ARTIST#${artist}`,
                    ":title": `SONG#${title}`
                }
            }).promise();
            items = data.Items || [];
        }

        else if (artist && year && !album && !title) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "year-index",
                KeyConditionExpression: "#yr = :year",
                ExpressionAttributeNames: { "#yr": "year" },
                ExpressionAttributeValues: { ":year": year }
            }).promise();
            items = (data.Items || []).filter(
                x => x.artist === artist
            );
        }

        else if (title && year && !artist && !album) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "title-index",
                KeyConditionExpression: "title = :title",
                ExpressionAttributeValues: { ":title": title }
            }).promise();
            items = (data.Items || []).filter(
                x => x.year === year
            );
        }

        else if (title && album && !artist && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "title-index",
                KeyConditionExpression: "title = :title",
                ExpressionAttributeValues: { ":title": title }
            }).promise();
            items = (data.Items || []).filter(
                x => x.album && x.album.toLowerCase()
                      .includes(album.toLowerCase())
            );
        }
        else if (album && !artist && !title && !year) {
            const data = await dynamo.scan({
                TableName: TABLE,
                FilterExpression: "contains(album, :album)",
                ExpressionAttributeValues: { ":album": album }
            }).promise();
            items = data.Items || [];
        }


        else if (artist && album && year && !title) {
            const data = await dynamo.query({
                TableName: TABLE,
                IndexName: "album-index",
                KeyConditionExpression:
                    "PK = :pk AND begins_with(album_title, :album)",
                ExpressionAttributeValues: {
                    ":pk":    `ARTIST#${artist}`,
                    ":album": album
                }
            }).promise();
            items = (data.Items || []).filter(
                x => x.year === year
            );
        }
        else if (artist && title && year && !album) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression:
                    "PK = :pk AND begins_with(SK, :title)",
                ExpressionAttributeValues: {
                    ":pk":    `ARTIST#${artist}`,
                    ":title": `SONG#${title}`
                }
            }).promise();
            items = (data.Items || []).filter(
                x => x.year === year
            );
        }
        else if (artist && title && album && !year) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression:
                    "PK = :pk AND begins_with(SK, :title)",
                ExpressionAttributeValues: {
                    ":pk":    `ARTIST#${artist}`,
                    ":title": `SONG#${title}`
                }
            }).promise();
            items = (data.Items || []).filter(
                x => x.album && x.album.toLowerCase()
                      .includes(album.toLowerCase())
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
                x.album && x.album.toLowerCase()
                    .includes(album.toLowerCase())
            );
        }

        else if (artist && title && album && year) {
            const data = await dynamo.query({
                TableName: TABLE,
                KeyConditionExpression:
                    "PK = :pk AND begins_with(SK, :title)",
                ExpressionAttributeValues: {
                    ":pk":    `ARTIST#${artist}`,
                    ":title": `SONG#${title}`
                }
            }).promise();
            items = (data.Items || []).filter(x =>
                x.year === year &&
                x.album && x.album.toLowerCase()
                    .includes(album.toLowerCase())
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
                filters.push("title = :title");
                values[":title"] = title;
            }
            if (year) {
                filters.push("#yr = :year");
                values[":year"] = year;
                names["#yr"]    = "year";
            }
            if (artist) {
                filters.push("artist = :artist");
                values[":artist"] = artist;
            }

            scanParams.FilterExpression         = filters.join(" AND ");
            scanParams.ExpressionAttributeValues = values;
            if (Object.keys(names).length > 0) {
                scanParams.ExpressionAttributeNames = names;
            }

            const data = await dynamo.scan(scanParams).promise();
            items = data.Items || [];
        }

        if (!items || items.length === 0) {
            return res.json({
                message: "No result is retrieved. Please query again"
            });
        }
        res.json(items);

    } catch (err) {
        console.error("Songs query error:", err);
        res.status(500).json({
            message: "Error fetching songs"
        });
    }
});

module.exports = router;
