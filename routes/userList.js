const express = require('express');
const dateFormat = require("dateformat");
const router = express.Router();
const conn = require("../database").init();


// userList GET
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM facecog.admin_users'

    conn.query(sql, (err, row) => {
        dataFormat(row)
        res.json(row)
    })
})

// userList 데이터 가공
function dataFormat(row) {
    for (key in row) {
        row[key].date = dateFormat(row[key].created_at, "yyyy-mm-dd");
    }
}

module.exports = router