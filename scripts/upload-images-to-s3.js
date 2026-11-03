require("dotenv").config();
const fs = require("fs");
const path = require("path");
const https = require("https");

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();


const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const JSON_FILE = "./dataset/2026a2_songs.json";

const songsData = JSON.parse(
    fs.readFileSync(JSON_FILE, "utf8")
);


function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            response.pipe(file);

            file.on("finish", () => {
                file.close(resolve);
            });
        }).on("error", (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}


async function uploadToS3(localFilePath, s3Key) {
    const fileContent = fs.readFileSync(localFilePath);

    const params = {
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: "image/jpeg"
    };

    await s3.upload(params).promise();

    return `https://${BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
}

async function main() {

    const tempDir = "./temp-images";

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const uploadedImages = new Set();

    for (const song of songsData.songs) {

        const imageUrl = song.img_url;

        const filename = path.basename(imageUrl);

        if (uploadedImages.has(filename)) {
            console.log(`Skipping duplicate: ${filename}`);
            continue;
        }

        uploadedImages.add(filename);

        const localPath = path.join(tempDir, filename);

        try {

            console.log(`Downloading: ${filename}`);

            await downloadImage(imageUrl, localPath);

            const s3Key = `artist-images/${filename}`;

            console.log(`Uploading to S3: ${s3Key}`);

            const uploadedUrl = await uploadToS3(localPath, s3Key);

            console.log(`Uploaded Successfully:`);
            console.log(uploadedUrl);

        } catch (err) {

            console.error(`Error processing ${filename}`);
            console.error(err);

        }
    }

    console.log("\nAll images uploaded successfully!");
}

main();