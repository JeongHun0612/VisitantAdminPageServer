require("dotenv").config();

exports.SQL = {
    //   host: process.env.DB_HOST,
    //   port: process.env.DB_PORT,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASS,
    //   database: process.env.DB_NAME,

    host: "facecog-rds.cwct330tepas.ap-northeast-2.rds.amazonaws.com",
    user: "facecog",
    password: "!j14682533",
    database: "facecog",
    port: 3306,
    connectionLimit: 50,
    waitForConnections: true,
};

exports.KEY = {
    secret_key: "Song_secret",
};