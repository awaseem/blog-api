/**
 * Created by awaseem on 15-08-20.
 */

import express from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import databaseConfig from "./config/database";
import { router as albumApi } from "./api/albumApi";
import { router as userApi } from "./api/userApi";
import { router as imageApi } from "./api/imageApi";
import { allowCrossDomain } from "./middlewares/crossDomain";

let app = express();

app.use(allowCrossDomain);
app.use(express.static(`${__dirname}/public`));
app.use(bodyparser.urlencoded({
    limit: "10mb",
    extended: true
}));
app.use(bodyparser.json({
    limit: "10mb"
}));

if (process.env.MONGO) {
    mongoose.connect(process.env.MONGO);
}
else {
    mongoose.connect(databaseConfig.url);
}

app.use("/api/user", userApi);
app.use("/api/album", albumApi);
app.use("/api/image", imageApi);

if (app.get("env") === "production") {
    app.use( (err, req, res) => {
        res.status(500).json({ message: "Error: Server failed to process request!"});
    });
}

let server = app.listen(3000, function () {
    console.log("App Running on localhost:3000");
});