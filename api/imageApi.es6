
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
        },
        "group": group
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
    let imageId = req.body.id;
    if (!imageId) {
        return res.status(400).json({ message: "Error: no id given for image update"});
    }
    imageModel.findById(imageId, (err, image) => {
        if (err) {
            return res.status(500).json({ message: "Error: failed to find image"});
        }
        if (!image) {
            return res.status(400).json({ message: "Error: could not find image with that id"});
        }
        if (req.body.name) {
            image.title = req.body.title;
        }
        if (req.body.description) {
            image.description = req.body.description;
        }
        image.save((err) => {
            if (err) {
                return res.status(500).json({ message: "Error: failed to update image" });
            }
            return res.json({ message: `Updated album: ${image._id}`, data: image});
        });
    });
});

router.delete("/", (req, res) => {
    let imageId = req.body.id;
    if (!imageId) {
        return res.status(400).json({ message: "Error: no id given for image deletion"});
    }
    imageModel.findByIdAndRemove(imageId, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error: failed to delete image" });
        }
        return res.json({ message: `Deleted image: ${imageId}`});
    });
});

export { router };