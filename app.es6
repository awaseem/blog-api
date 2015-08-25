/**
 * Created by awaseem on 15-08-20.
 */

let express = require("express");
let mongoose = require("mongoose");
let databaseConfig = require("./config/database");
let publicApi = require("./api/publicApi");
let app = express();

app.use(express.static(`${__dirname}/public`));

mongoose.connect(databaseConfig.url);

app.use("/api", publicApi);

let server = app.listen(3000, function () {
    console.log("App Running on localhost:3000");
});