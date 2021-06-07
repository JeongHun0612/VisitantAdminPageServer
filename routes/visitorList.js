const express = require('express');
const router = express.Router();
const conn = require("../database").init();

router.get('/', (req, res) => {
    console.log("welcome visitorList API");
})

module.exports = router