const express = require('express');
const dateFormat = require("dateformat");
const router = express.Router();
const conn = require("../database").init();

// userList GET
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM admin_users'

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            dataFormat(row)
            res.json(row)
        }
    })
})

// userList 관리자 권한 승인
router.post('/authUpdate/:id', (req, res) => {
    const idx = req.params.id;
    const sql = "UPDATE admin_users SET role = 'admin' WHERE id = " + idx;

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            console.log("success role update");
            res.sendStatus(200);
        }
    })
})

// userList 관리자 권한 해제
router.post('/authDelete/:id', (req, res) => {
    const idx = req.params.id;
    const sql = "UPDATE admin_users SET role = '' WHERE id = " + idx;

    conn.query(sql, (err, row) => {
        if (err) console.log(err)
        else {
            console.log("success auth Release");
            res.sendStatus(200);
        }
    })
})

// userList user 삭제
router.delete("/delete/:id", (req, res) => {
    const idx = req.params.id;

    const sql = "DELETE FROM admin_users WHERE id = " + idx;
    conn.query(sql, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("success user delete");
            res.sendStatus(200);
        }
    });
});

// userList 데이터 가공
function dataFormat(row) {
    for (key in row) {
        row[key].date = dateFormat(row[key].created_at, "yyyy-mm-dd");
    }
}

module.exports = router