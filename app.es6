/**
 * Created by awaseem on 15-08-20.
 */

import express from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import databaseConfig from "./config/database"
import { router as albumApi } from "./api/albumApi";
import { router as userApi } from "./api/userApi"
let app = express();

app.use(express.static(`${__dirname}/public`));
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());

mongoose.connect(databaseConfig.url);

app.use("/api/album", albumApi);
app.use("/api/user", userApi);

let server = app.listen(3000, function () {
    console.log("App Running on localhost:3000");
});