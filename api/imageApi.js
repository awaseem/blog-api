
import express from "express";
import imgur from "imgur";
import path from "path";
import config from "nconf";
import { imageModel } from "../models/image";
import { auth } from "../middlewares/authentication";
import commonRoute from "../common/commonRoutes";
let router = express.Router();

imgur.setClientId(config.get("imgurClientId"));

let saveImageModel = (req, res) => {
    let newImageObj = new imageModel();

    newImageObj.name = req.body.name;
    newImageObj.description = req.body.description;
    if (req.body.imageUrl) {
        newImageObj.url = req.body.imageUrl;
    }
    else if (req.body.imgurData) {
        newImageObj.url = req.body.imgurData.data.link;
        newImageObj.imgurData = JSON.stringify(req.body.imgurData);
    }
    newImageObj.group = req.user.group;

    newImageObj.save( (err) => {
        if (err) {
            res.status(500).json({
                message: `Error: failed to save image to database, sending the image url`,
                data: imageUrl
            });
        }
        else {
            res.json({ message: "Added image to database", data: newImageObj});
        }
    });
};

// Public routes

/**
 * "/" GET allows you to get all images in the database ordered by date.
 * They can be filtered out by group.
 * Each query is limited to 9 results, to get more simply pass the last results date to a new get request to retrieve the next 9.
 */
router.get("/", (req, res, next) => commonRoute.GET(req, res, next, imageModel));

// private Api

router.use(auth);

/**
 * "/" POST allows you to add a new image.
 * If both an imageUrl or data is given then the URL is given priority.
 * parameters:
 * name (String): name of image
 * description (String): short summary about the image
 * imageUrl (String): a url to add to the database
 * imagesData (String): base64 encoded image
 */
router.post("/", (req, res) => {
    // Post request validation
    if ( !req.body.name || !req.body.description ) {
        return res.status(400).json({ message: "Error: missing parameters that are required to upload images"});
    }
    let image64;
    let imageUrl;
    if (req.body.imageData) {
        image64 = req.body.imageData;
    }
    else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
    }
    else {
        return res.status(400).json({ message: "Error: missing image data/url!"});
    }

    if (imageUrl) {
        saveImageModel(req, res);
    }
    else if (image64) {
        // Uplaod images
        imgur.uploadBase64(image64)
            .then( (json) => {
                req.body.imgurData = json;
                saveImageModel(req, res);
            })
            .catch( (err) => {
                res.status(500).json({ message: `Error: The following error has occurred: ${err.message}`});
            });
    }
});

/**
 * "/" PUT allows you to update the image based on what parameters are presented
 * parameters:
 * Id (String): Id for the image to update
 * name (String, Optional): New title for the image
 * description (String, Optional): New description for the image
 */
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
            return res.json({ message: `Updated image: ${image._id}`, data: image});
        });
    });
});

/**
 * "/" DELETE allows you to delete the image based on what parameters are presented
 * parameters:
 * Id (String): Id for the image to update
 */
router.delete("/", (req, res) => commonRoute.DELETE(req, res, next, imageModel));

export { router };
