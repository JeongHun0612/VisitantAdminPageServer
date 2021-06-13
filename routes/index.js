const express = require('express');
const router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
})

// router.get('/', (req, res) => {
//     res.json({
//         message: "Welcome to the API."
//     });
// })

module.exports = router