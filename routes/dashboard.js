const express = require('express');
const router = express.Router();
const dateFormat = require("dateformat");
const conn = require("../database").init();

// dashboard GET
router.get('/', (req, res) => {
    const sql = "SELECT * FROM faceInfo"

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            res.json(row)
        }
    })
})

router.get('/gender', (req, res) => {
    const dateType = req.query.dateType;
    console.log(dateType)
    var sql = "SELECT gender, created_at FROM faceInfo"

    const date = new Date().getDate()
    const month = dateFormat(new Date(), "yyyy-mm")
    const year = new Date().getFullYear()

    if (dateType !== "undefined") {
        switch (dateType) {
            case "day":
                sql = "SELECT gender, created_at FROM faceInfo"
                break;
            case "month":
                sql = "SELECT gender, created_at FROM faceInfo WHERE created_at LIKE '" + month + "%'"
                break;
            case "year":
                sql = "SELECT gender, created_at FROM faceInfo WHERE created_at LIKE '" + year + "%'"
                break;
            default:
                console.log("default")
                break;
        }
    }

    var femaleCount = 0;
    var maleCount = 0;
    var genderArray = [];

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            row.forEach(item => {
                if (item.gender == "M") maleCount++;
                else femaleCount++;
            });
            genderArray = [femaleCount, maleCount]
            console.log(genderArray)
            res.json(genderArray)
        }
    })
})

module.exports = router