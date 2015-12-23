/**
 * Created by awaseem on 15-08-20.
 */

import express from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import morgan from "morgan";
import databaseConfig from "./config/database";
import expressConfig from "./config/express";
import { router as blogApi } from "./api/blogApi";
import { router as userApi } from "./api/userApi";
import { router as imageApi } from "./api/imageApi";
import { allowCrossDomain } from "./middlewares/crossDomain";

let app = express();

app.use(allowCrossDomain);
app.use(express.static(`${__dirname}/public`));
app.use(bodyparser.urlencoded({
    limit: expressConfig.bodyparserSizeLimit,
    extended: expressConfig.extended
}));
app.use(bodyparser.json({
    limit: expressConfig.bodyparserSizeLimit
}));

if (process.env.MONGO) {
    mongoose.connect(process.env.MONGO);
}
else {
    mongoose.connect(databaseConfig.url);
}

// Setup all of our API routes
app.use("/api/user", userApi);
app.use("/api/blog", blogApi);
app.use("/api/image", imageApi);

// Catch any other routes and send a 404
app.all("*", (req, res) => {
    res.status(404).json( { message: "Error: Route does not exist!"} );
});

// Setup production stuff here if you'd like otherwise do dev stuff here
if (app.get("env") === "production") {
    app.use( (err, req, res) => {
        res.status(500).json({ message: "Error: Server failed to process request!"});
    });
}
else {
    app.use(morgan("combined"));
}

let server = app.listen(expressConfig.port, function () {
    console.log(`App Running on http://localhost:${expressConfig.port}`);
});

export default app;
