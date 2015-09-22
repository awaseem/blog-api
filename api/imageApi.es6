
import express from "express";
import imgur from "imgur";
import path from "path";
import imgurConfig from "../config/imgur";
import { imageModel } from "../models/image";
import { auth } from "../middlewares/authentication";
import { createImages, removeImages } from "../utils/imageApiUtils";

let router = express.Router();

imgur.setClientId(imgurConfig.clientId);

router.get("/", (req, res) => {
    let dateQuery = req.query.date ? new Date(req.query.date) : new Date();
    let group = req.query.group;
    imageModel.find({
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
    // Post request validation
    if ( !req.body.name || !req.body.description || !req.body.imageData ) {
        return res.status(400).json({ message: "Error: missing parameters that are required to upload images"})
    }

    let image = req.body.imageData;
    // Uplaod images
    imgur.uploadBase64(image)
        .then( (json) => {
            let newImageObj = new imageModel();

            newImageObj.name = req.body.name;
            newImageObj.description = req.body.description;
            newImageObj.url = json.data.link;
            newImageObj.imgurData = JSON.stringify(json);
            newImageObj.group = req.user.group;

            newImageObj.save( (err) => {
                if (err) {
                    res.status(500).json({
                        message: `Error: failed to save image to database, sending the image url`,
                        data: json.data.link
                    });
                }
                else {
                    res.json({ message: "Added image to database", data: newImageObj});
                }
            })
        })
        .catch( (err) => {
            res.status(500).json({ message: `Error: The following error has occurred: ${err.message}`});
        });
});

router.put("/", (req, res) => {
    //TODO add put method for updating images
});

export { router };