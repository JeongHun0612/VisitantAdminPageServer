const express = require('express');
const router = express.Router();
const dateFormat = require("dateformat");
const conn = require("../database").init();

const day = dateFormat(new Date(), "yyyy-mm-dd")
const year = new Date().getFullYear()
const month = dateFormat(new Date(), "yyyy-mm")

router.get('/visitorCount', (req, res) => {
    var sql = "SELECT * FROM faceInfo"

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            res.json(getVisitorCount(row))
        }
    })
})

// dashBoard visitorNumLine GET
router.get('/visitorNumLine', (req, res) => {
    const dateType = req.query.dateType;
    var sql = getSelectDataSQL(dateType)

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            res.json(getVisitorNumData(row, dateType))
        }
    })
})

// dashBoard genderPie GET
router.get('/genderPie', (req, res) => {
    const dateType = req.query.dateType;
    var sql = getSelectDataSQL(dateType)

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
            res.json(genderArray)
        }
    })
})

// dashBoard ageBar GET
router.get('/ageBar', (req, res) => {
    const dateType = req.query.dateType;
    var sql = getSelectDataSQL(dateType)

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            res.json(getAgeData(row))
        }
    })
})

// getSelectDataSQL(day, month, year)
function getSelectDataSQL(dateType) {
    var sql = ""
    if (dateType !== "undefined") {
        switch (dateType) {
            case "day":
                sql = "SELECT * FROM faceInfo WHERE created_at LIKE '" + day + "'"
                break;
            case "month":
                sql = "SELECT * FROM faceInfo WHERE created_at LIKE '" + month + "%'"
                break;
            case "year":
                sql = "SELECT * FROM faceInfo WHERE created_at LIKE '" + year + "%'"
                break;
            default:
                console.log("default")
                break;
        }
    }
    return sql
}

// getVisitorCount
function getVisitorCount(row) {
    var resultDataArray = []
    var monthCount = 0
    var dayCount = 0

    for (key in row) {
        if (month == dateFormat(row[key].created_at, "yyyy-mm")) {
            monthCount++
        }
        if (day == dateFormat(row[key].created_at, "yyyy-mm-dd")) {
            dayCount++
        }
    }

    resultDataArray[0] = row.length
    resultDataArray[1] = monthCount
    resultDataArray[2] = dayCount

    return resultDataArray
}

// getVisitorNumData
function getVisitorNumData(row, dateType) {
    var resultArray = [];
    var monthDataArray = [];
    var dayDataArray = [];
    var timeDataArray = [];

    const date = new Date();
    const monthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    var count = 0;

    for (key in row) {
        monthDataArray[key] = dateFormat(row[key].created_at, "m")
        dayDataArray[key] = dateFormat(row[key].created_at, "d")
        timeDataArray[key] = dateFormat(row[key].created_at, "HH")
    }

    if (dateType == "year") visitorNumData(12, monthDataArray)
    else if (dateType == "month") visitorNumData(monthLastDay, dayDataArray)
    else if (dateType == "day") visitorNumData(24, timeDataArray)

    function visitorNumData(length, dataArray) {
        for (var i = 1; i <= length; i++) {
            for (var j = 0; j < dataArray.length; j++) {
                if (i == dataArray[j]) {
                    count++;
                }
            }
            resultArray[i - 1] = count;
            count = 0;
        }
    }

    return resultArray
}

// getAgeData
function getAgeData(row) {
    var resultArray = []
    var ageDataArray = []
    var ageDataList = [0, 10, 20, 30, 40, 50, 60, 70]
    var count = 0;
    var lastCount = 0;

    for (key in row) {
        ageDataArray[key] = (row[key].ageRange_low + row[key].ageRange_high) / 2
    }

    for (var i = 0; i < ageDataList.length - 1; i++) {
        for (var j = 0; j < ageDataArray.length; j++) {
            if (i == parseInt(ageDataArray[j] / 10)) {
                count++;
            }
            if (parseInt(ageDataArray[j] / 10) >= 7) {
                lastCount++;
            }
        }
        resultArray[i] = count;
        count = 0;
    }
    resultArray[resultArray.length] = lastCount;
    lastCount = 0;

    return resultArray
}

module.exports = router