require("dotenv").config();

const fs = require("fs");
const path = require("path");

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = "music";

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const SONGS_FILE = "./dataset/2026a2_songs.json";

const songsData = JSON.parse(
    fs.readFileSync(SONGS_FILE, "utf8")
);


function buildS3ImageUrl(originalUrl) {

    const filename = path.basename(originalUrl);

    return `https://${BUCKET_NAME}.s3.amazonaws.com/artist-images/${filename}`;
}

async function loadSongs() {

    try {

        for (const song of songsData.songs) {


            const artist = song.artist.trim();

            const title = song.title.trim();

            const album = song.album.trim();



            const year = song.year.toString().trim();


            const PK =
                `ARTIST#${artist}`;

            const SK =
                `SONG#${title}#${album}`;

            const album_title = album;

            const artist_album_key =
                `${artist}#${album}`;

            const artist_title_album =
                `${artist}#${title}#${album}`;

            const image_url =
                buildS3ImageUrl(song.img_url);


            const item = {

                PK,
                SK,

                artist,
                title,
                album,
                year,

                album_title,

                artist_album_key,
                artist_title_album,

                image_url
            };

           

            const params = {
                TableName: TABLE_NAME,
                Item: item
            };

            await dynamodb.put(params).promise();

            console.log(
                `Inserted: ${artist} - ${title}`
            );
        }

        console.log("\nAll songs inserted successfully!");

    } catch (err) {

        console.error("Error:");
        console.error(err);

    }
}

loadSongs();