
import express from "express";
import imgur from "imgur";
import imgurConfig from "../config/imgur";
import { imageModel } from "../models/image";
import { auth } from "../middlewares/authentication";

let router = express.Router();

imgur.setClientId(imgurConfig.clientId);

router.get("/", (req, res) => {
    let dateQuery = req.query.date ? new Date(req.query.date) : new Date();
    let group = req.query.group;
    imageModel.find({
        "group": group,
        "createdOn": {
            "$lte": dateQuery
        }
    }, null, { sort: {createdOn: -1}, limit: 9 }, (err, results) => {
        if (err) {
            return res.status(400).json({ message: "Error: could not find images" });
        }
        res.json(results);
    });
});

router.use(auth);

router.post("/", (req, res) => {
    let imageData = req.body.data;
    imgur.uploadBase64(imageData)
        .then((json) => {
            res.json(json);
        })
        .catch((err) => {
            res.json(err);
        });
});

export { router };