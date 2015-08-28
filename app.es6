/**
 * Created by awaseem on 15-08-20.
 */

let express = require("express");
let mongoose = require("mongoose");
let bodyparser = require("body-parser");
let databaseConfig = require("./config/database");
let publicApi = require("./api/publicApi");
let privateApi = require("./api/privateApi");
let app = express();

app.use(express.static(`${__dirname}/public`));
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());

mongoose.connect(databaseConfig.url);

app.use("/api", publicApi);
app.use("/api", privateApi);

let server = app.listen(3000, function () {
    console.log("App Running on localhost:3000");
});