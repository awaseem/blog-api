
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
    let imageData = req.body.image;
    imgur.uploadBase64(imageData)
        .then((json) => {
            let newImage = new imageModel();

            newImage.name = req.body.name;
            newImage.url = json.url;
            newImage.description = req.body.description;
            newImage.group = req.user.group;

            newImage.save((err) => {
                if (err) {
                    return res.status(500).json({ message: `Error: could not save image data due to the following error: ${err.message}`});
                }
                res.json( { message: "Added image!", data: newImage});
            })
        })
        .catch((err) => {
            res.status(503).json({ message: `Error: could not upload image to imgur because of the following error ${err.message}`});
        });
});

router.put("/", (req, res) => {
    //TODO add put method for updating images
});

export { router };