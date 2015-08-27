
let albumModel = require("../models/album");
let express = require("express");
let router = express.Router();

router.get("/album", (req, res) => {
    let dateQuery = req.query.date ? new Date(req.query.date) : new Date();
    albumModel.find({
        "createdOn": {
            "$lte": dateQuery
        }
    }, null, { sort: {createdOn: -1} }, (err, results) => {
        if (err) {
            return next(err);
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

// Route just to test inserting data
router.post("/album", (req, res) => {
    let newAlbum = new albumModel();
    newAlbum.title = req.body.title;
    newAlbum.description = req.body.description;
    newAlbum.images = [req.body.image];

    newAlbum.save((err) => {
        if (err) {
            return res
                .status(400)
                .json({ message: "Error: could not add album data to server"});
        }
        res.json( { message: "Added album", data: newAlbum});
    });
});

module.exports = router;