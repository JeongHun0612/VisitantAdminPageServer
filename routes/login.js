const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");
const secret = require("../config").KEY;

const conn = require("../database").init();

// 계정 정보 GET
router.get("/", (req, res) => {
    const token = req.headers["access-token"]; // 헤더에 포함된 token값
    let the_secret_key = "the_secret_key";

    jwt.verify(token, the_secret_key, (err, toekn_res) => { // token값 비교
        if (err) console.log(err);
        else {
            res.json({
                id: toekn_res.id,
                name: toekn_res.name,
                email: toekn_res.email,
            });
        }
    });
});

// 로그인 검사
router.post("/", (req, res) => {
    const userInfo = {
        email: req.body.email,
        password: req.body.password,
    };
    const sql = 'SELECT * FROM admin_users WHERE email = "' + userInfo.email + '"';
    conn.query(sql, (err, row) => {
        if (row[0] !== undefined && row[0].email == userInfo.email) {
            var pw_bytes = cryptoJS.AES.decrypt(row[0].password, secret.secret_key); // 복호화
            var pw_decrypted = JSON.parse('"' + pw_bytes.toString(cryptoJS.enc.Utf8) + '"'); // 복호화된 데이터 JSON 형식 변환
            if (pw_decrypted == userInfo.password) {
                const token = jwt.sign({
                        id: row[0].id,
                        name: row[0].name,
                        email: row[0].email,
                    },
                    "the_secret_key"
                );
                res.json({ token });
            } else {
                res.json({
                    status: 400,
                    message: "비밀번호를 확인해주세요.",
                });
            }
        } else {
            res.json({
                status: 400,
                message: "이메일과 비밀번호를 확인해주세요.",
            });
        }
        if (err) {
            console.log(err);
        }
    });
});

// // MIDDLEWARE
// function verifyToken(req, res, next) {
//     const beareHeader = req.headers["authorization"];

//     if (typeof beareHeader !== "undefined") {
//         const bearer = beareHeader.split(" ");
//         const bearerToken = bearer[1];
//         req.token = bearerToken;
//         next();
//     } else {
//         res.sendStatus(401);
//     }
// }

module.exports = router;