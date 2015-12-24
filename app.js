/**
 * Created by awaseem on 15-08-20.
 */

import express from "express";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import morgan from "morgan";
import config from "nconf";
import expressConfig from "./config/express";
import { router as blogApi } from "./api/blogApi";
import { router as userApi } from "./api/userApi";
import { router as imageApi } from "./api/imageApi";
import { allowCrossDomain } from "./middlewares/crossDomain";

let app = express();

// Setup our config staging, check environment variables first then
// look for a file
config.env().file({ file: "./config/config.json" });

app.use(allowCrossDomain);
app.use(express.static(`${__dirname}/public`));
app.use(bodyparser.urlencoded({
    limit: expressConfig.bodyparserSizeLimit,
    extended: expressConfig.extended
}));
app.use(bodyparser.json({
    limit: expressConfig.bodyparserSizeLimit
}));

// Setup production stuff here if you'd like otherwise do dev stuff here
if (config.get("environment") === "prod") {
    mongoose.connect(config.get("database"));
    app.use( (err, req, res) => {
        res.status(500).json({ message: "Error: Server failed to process request!"});
    });
}
else if (config.get("environment") === "test") {
    mongoose.connect(config.get("testingDatabase"));
}
else if (config.get("environment") === "dev") {
    mongoose.connect(config.get("database"));
}

// Setup all of our API routes
app.use("/api/user", userApi);
app.use("/api/blog", blogApi);
app.use("/api/image", imageApi);

// Catch any other routes and send a 404
app.all("*", (req, res) => {
    res.status(404).json( { message: "Error: Route does not exist!"} );
});

let server = app.listen(expressConfig.port, function () {
    console.log(`App Running on http://localhost:${expressConfig.port}`);
});

export default app;
