const express = require("express");
const app = express();
const path = require('path');
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use("/", require("./routes/index"));
app.use("/api/register", require("./routes/register"));
app.use("/api/login", require("./routes/login"));
app.use("/api/dashBoard", require("./routes/dashBoard"));
app.use("/api/faceInfo", require("./routes/faceInfo"));
app.use("/api/visitorList", require("./routes/visitorList"));
app.use("/api/userList", require("./routes/userList"));

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

module.exports = app;