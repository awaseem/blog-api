/**
 * Created by awaseem on 15-08-20.
 */

let express = require("express");
let app = express();

app.get("/", function (req, res) {
    //res.sendFile("/Users/awaseem/Sandbox/Websites/brandom-tam-website/build/static/html/index.html");
    //res.send("hello world");
    res.sendFile(`${__dirname}/public/html/index.html`);
});

let server = app.listen(3000, function () {
    console.log("App Running on localhost:3000");
});