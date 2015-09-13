
import { albumModel } from "../models/album";
import { superuserModel } from "../models/superuser";
import { auth } from "../middlewares/authentication"
import jwtConfig from "../config/jwt";
import express from "express";
import jwt from "jsonwebtoken";
let router = express.Router();

router.get("/album", (req, res) => {
    let dateQuery = req.query.date ? new Date(req.query.date) : new Date();
    albumModel.find({
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

router.get("/album/:id", (req, res) => {
    albumModel.findById(req.params.id, (err, results) => {
        if (err) {
            return res
                .status(404)
                .json({ message: `Error: could not find album with id: ${req.params.id}`});
        }
        res.json(results);
    });
});

router.post("/auth", (req, res) => {
    if (!req.body.username) {
        return res.status(400).json({ message: "Error: No user given!"});
    }
    if (!req.body.password) {
        return res.status(400).json({ message: "Error: no password given!"})
    }
    superuserModel.findOne({
        "user.username": req.body.username
    }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Error occurred while finding user"});
        }
        if (!user) {
            return res.status(400).json({ message: "Auth Failed: could not find user"});
        }
        else if (user) {
            if (!user.validPassword(req.body.password)) {
                return res.status(400).json({ message: "Auth Failed: wrong password"});
            }
            else {
                let accessToken = jwt.sign( { data: user._id }, jwtConfig.secret, {
                    expiresInMinutes: 10
                });

                return res.json({ message: "Enjoy the token!", token: accessToken });
            }
        }
    })
});

router.use(auth);

// Route just to test inserting data
router.post("/album", (req, res) => {
    if ( !req.body.title || !req.body.description || (!req.body.images && !Array.isArray(req.body.images))) {
        return res.status(400).json({ message: "Error: invalid parameters"});
    }
    let newAlbum = new albumModel();
    newAlbum.title = req.body.title;
    newAlbum.description = req.body.description;
    newAlbum.images = req.body.images;

    newAlbum.save((err) => {
        if (err) {
            return res.status(500).json({ message: "Error: could not add album data to server"});
        }
        res.json( { message: "Added album", data: newAlbum});
    });
});

router.put("/album", (req, res) => {
    let albumId = req.body.id;
    if ( !albumId ) {
        return res.status(400).json({ message: "Error: no id given for album update"})
    }
    albumModel.findById(albumId, (err, album) => {
        if (err) {
            return res.status(500).json({ message: "Error: failed to find album"})
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

export { router };