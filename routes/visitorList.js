require("dotenv").config();
const express = require('express');
const dateFormat = require("dateformat");
const router = express.Router();
const conn = require("../database").init();
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

const s3Params = {
    Bucket: bucket
}

router.get('/', (req, res) => {
    const sql = 'SELECT * FROM face ORDER BY created_at DESC'

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            dataFormat(row)
            res.json(row)
        }
    })
})

// 날짜별 visitorList GET
router.get("/dateSearch", (req, res) => {
    const date = req.query.date;

    if (date != undefined && date.length == 10) {
        conn.query(
            'SELECT * FROM face WHERE created_at LIKE "' + date + '%" ORDER BY created_at DESC',
            (err, row) => {
                if (err) {
                    console.log(err);
                } else {
                    dataFormat(row)
                    res.json(row);
                }
            }
        );
    } else {
        const dateSplit1 = new Date(date.split(",")[0])
        const dateSplit2 = new Date(date.split(",")[1])

        sql1 = 'SELECT * FROM face WHERE created_at BETWEEN date("' + date.split(",")[0] + '") AND date("' + date.split(",")[1] + '")+1 ORDER BY created_at DESC';
        sql2 = 'SELECT * FROM face WHERE created_at BETWEEN date("' + date.split(",")[1] + '") AND date("' + date.split(",")[0] + '")+1 ORDER BY created_at DESC';

        const sql = dateSplit1 < dateSplit2 ? sql1 : sql2;

        conn.query(sql, (err, row) => {
            if (err) {
                console.log(err);
            } else {
                dataFormat(row)
                res.json(row);
            }
        });
    }
});

router.get('/faceSearch', (req, res) => {
    var searchResultList = [];

    s3.listObjectsV2(s3Params, (err, data) => {
        if (err) {
            throw err;
        } else {
            var contents = data.Contents;
            contents.forEach((content) => {
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
                    SimilarityThreshold: 90
                }

                client.compareFaces(params, function(err, response) {
                    if (err) {
                        //console.log(err, err.stack); // an error occurred
                    } else {
                        response.FaceMatches.forEach(data => {
                                var position = data.Face.BoundingBox
                                var similarity = data.Similarity
                                var contentKey = content.Key.substr(7, content.Key.length).split('.jpg')[0]
                                console.log(`The face at: ${position.Left}, ${position.Top} matches with ${similarity} % confidence`)

                                const sql = 'SELECT * FROM face WHERE ExternalImageId LIKE "%' + contentKey + '%"'
                                conn.query(sql, (err, row) => {
                                    if (err) console.log(err)
                                    else {
                                        searchResultList.push(row[0]);
                                    }
                                })

                            }) // for response.faceDetails
                    }
                });
            });

            if (data.IsTruncated) {
                let obj = Object.assign({}, s3Params, {
                    ContinuationToken: data.NextContinuationToken
                });
                getFaceSearchList(obj);
            }
        }
    });
    sleep(4000).then(() => {
        dataFormat(searchResultList)
        res.json(searchResultList)
    })
})

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// visitorList 데이터 가공
function dataFormat(row) {
    for (key in row) {
        row[key].date = dateFormat(row[key].created_at, "yyyy-mm-dd");
        row[key].time = dateFormat(row[key].created_at, "HH:MM:ss");
    }
}

module.exports = router