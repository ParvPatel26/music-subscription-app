require("dotenv").config();

const AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const BUCKET_NAME = process.env.S3_BUCKET_NAME;


async function createBucket() {

    try {

        const buckets = await s3.listBuckets().promise();

        const exists = buckets.Buckets.some(
            bucket => bucket.Name === BUCKET_NAME
        );

        if (exists) {
            console.log(`Bucket already exists: ${BUCKET_NAME}`);
            return;
        }

        await s3.createBucket({
            Bucket: BUCKET_NAME
        }).promise();

        console.log(`Bucket created successfully: ${BUCKET_NAME}`);


        const folders = [
            "artist-images/"
        ];

        for (const folder of folders) {

            await s3.putObject({
                Bucket: BUCKET_NAME,
                Key: folder
            }).promise();

            console.log(`Created folder: ${folder}`);
        }


        // const bucketPolicy = {
        //     Version: "2012-10-17",
        //     Statement: [
        //         {
        //             Sid: "PublicReadGetObject",
        //             Effect: "Allow",
        //             Principal: "*",
        //             Action: "s3:GetObject",
        //             Resource: [
        //                 `arn:aws:s3:::${BUCKET_NAME}/*`
        //             ]
        //         }
        //     ]
        // };

        // await s3.putBucketPolicy({
        //     Bucket: BUCKET_NAME,
        //     Policy: JSON.stringify(bucketPolicy)
        // }).promise();

        // console.log("Bucket policy applied");

    } catch (err) {

        console.error("Error:");
        console.error(err);

    }
}

createBucket();