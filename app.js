/**
 * Created by awaseem on 15-08-20.
 */

var express = require("express");
var app = express();

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html');
    //res.send("this is a test");
});

var server = app.listen(3000, function () {
    console.log("App Running on localhost:3000");
});