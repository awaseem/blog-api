
let albumModel = require("../models/album");
let express = require("express");
let router = express.Router();

router.get("/", (req, res) => {
    res.send("hello world");
});

router.get("/:id", (req, res) => {
    res.send(req.params.id);
});

module.exports = router;