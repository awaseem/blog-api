
import express from "express";
import imgur from "imgur";
import multer from "multer";
import path from "path";
import imgurConfig from "../config/imgur";
import { imageModel } from "../models/image";
import { auth } from "../middlewares/authentication";
import { createImages, removeImages } from "../utils/imageApiUtils";

let router = express.Router();
let upload = multer({ dest: "build/uploads/" });

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

router.post("/", upload.single("photo"), (req, res) => {
    // Post request validation
    if ( !req.body.name && !req.body.description && !req.file.length ) {
        res.status(400).json({ message: "Error: missing parameters that are required to upload images"})
    }

    // Uplaod images
    let image = `${ path.dirname(require.main.filename) }/uploads/${ req.file.filename }`;
    imgur.uploadFile(image)
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
                        data: json.link
                    });
                }
                else {
                    res.json({ message: "Added image to database", data: newImageObj});
                }
                fs.unlink(image, (err) => {
                    if (err) {
                        console.log(err.message); //TODO Add better logging for error handling
                    }
                })
            })
        })
        .catch( (err) => {
            res.json({ message: `Error: The following error: ${err.message}`});
        });
});

router.put("/", (req, res) => {
    //TODO add put method for updating images
});

export { router };