require("dotenv").config();
const async = require('async')
const AWS = require('aws-sdk')
const bucket = 'final-facecog-bucket' // the bucketname without s3://
const photo_source = 'upload/visitor_07ae6da9-8727-4d04-b4a3-e490ada42be7.jpg'

const config = new AWS.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const s3 = new AWS.S3();
const client = new AWS.Rekognition();

var searchResultList = [];
const s3Params = {
    Bucket: bucket
}

s3.listObjectsV2(s3Params, (err, data) => {
    if (err) {
        throw err;
    } else {
        let contents = data.Contents;

        contents.forEach((content) => {
            var cotentString = content.Key;
            console.log(content.Key.substr(7, cotentString.length).split('.jpg')[0]);

            const params = {
                SourceImage: {
                    S3Object: {
                        Bucket: bucket,
                        Name: photo_source
                    },
                },
                TargetImage: {
                    S3Object: {
                        Bucket: bucket,
                        Name: content.Key
                    },
                },
                SimilarityThreshold: 70
            }

            client.compareFaces(params, function(err, response) {
                if (err) {
                    //console.log(err, err.stack); // an error occurred
                } else {
                    response.FaceMatches.forEach(data => {
                            let position = data.Face.BoundingBox
                            let similarity = data.Similarity
                            console.log(`The face at: ${position.Left}, ${position.Top} matches with ${similarity} % confidence`)
                            searchResultList.push(content.Key);
                        }) // for response.faceDetails
                }
            });
        });

        if (data.IsTruncated) {
            let obj = Object.assign({}, s3Params, {
                ContinuationToken: data.NextContinuationToken
            });
            getList(obj);
        }
    }
});