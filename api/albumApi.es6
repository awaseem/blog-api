
import { albumModel } from "../models/album";
import { superuserModel } from "../models/superuser";
import { auth } from "../middlewares/authentication"
import jwtConfig from "../config/jwt";
import express from "express";
import jwt from "jsonwebtoken";
let router = express.Router();

// Public routes

/**
 * "/" GET allows you to get all albums in the database ordered by date.
 * They can be filtered out by group.
 * Each query is limited to 9 results, to get more simply pass the last results date to a new get request to retrieve the next 9.
 */
router.get("/", (req, res) => {
    let dateQuery = req.query.date ? new Date(req.query.date) : new Date();
    let group = req.query.group;
    albumModel.find({
        "group": group,
        "createdOn": {
            "$lte": dateQuery
        }
    }, null, { sort: {createdOn: -1}, limit: 9 }, (err, results) => {
        if (err) {
            return res.status(400).json({ message: "Error: could not find albums"});
        }
        res.json(results);
    });
});

/**
 * "/:id" GET allows you to retrieve one album item based on the database id
 */
router.get("/:id", (req, res) => {
    albumModel.findById(req.params.id, (err, results) => {
        if (err || !results) {
            return res.status(404).json({ message: `Error: could not find album with id: ${req.params.id}`});
        }
        res.json(results);
    });
});

// Private Api

router.use(auth);

/**
 * "/" POST allows you to add a new album.
 * parameters:
 * Title (String): name of album
 * Description (String): short summary about the album
 * Images (String): a list of image urls that within the album
 */
router.post("/", (req, res) => {
    if ( !req.body.title || !req.body.description || (!req.body.images && !Array.isArray(req.body.images))) {
        return res.status(400).json({ message: "Error: invalid parameters"});
    }
    let newAlbum = new albumModel();
    newAlbum.title = req.body.title;
    newAlbum.description = req.body.description;
    newAlbum.images = req.body.images;
    newAlbum.group = req.user.group;

    newAlbum.save((err) => {
        if (err) {
            return res.status(500).json({ message: "Error: could not add album data to server"});
        }
        res.json( { message: "Added album", data: newAlbum});
    });
});

/**
 * "/" PUT allows you to update the album based on what parameters are presented
 * parameters:
 * Id (String): Id for the album to update
 * Title (String, Optional): New title for the album
 * Description (String, Optional): New description for the album
 * Images (String, Optional): New array of images
 */
router.put("/", (req, res) => {
    let albumId = req.body.id;
    if ( !albumId ) {
        return res.status(400).json({ message: "Error: no id given for album update"})
    }
    albumModel.findById(albumId, (err, album) => {
        if (err) {
            return res.status(500).json({ message: "Error: failed to find album"});
        }
        if (!album) {
            return res.status(400).json({ message: "Error: could not find album with that ID"});
        }
        if (req.body.title) {
            album.title = req.body.title;
        }
        if (req.body.description) {
            album.description = req.body.description;
        }
        if (req.body.images) {
            album.images = req.body.images;
        }
        album.save((err) => {
            if (err) {
                return res.status(500).json({ message: "Error: failed to update album" });
            }
            return res.json({ message: `Updated album: ${album._id}`, data: album});
        });
    });
});

/**
 * "/" DELETE allows you to delete the album based on what parameters are presented
 * parameters:
 * Id (String): Id for the album to update
 */
router.delete("/", (req, res) => {
    let albumId = req.body.id;
    if (!albumId) {
        return res.status(400).json({ message: "Error: no id given for album deletion"});
    }
    albumModel.findByIdAndRemove(albumId, (err) => {
        if (err) {
            return res.status(500).json({ message: "Error: failed to delete album" });
        }
        return res.json({ message: `Deleted album: ${albumId}`});
    });
});

export { router };