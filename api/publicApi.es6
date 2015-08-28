
let albumModel = require("../models/album");
let express = require("express");
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

module.exports = router;