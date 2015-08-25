
let mongoose = require("mongoose");

let album = new mongoose.Schema({
    Title: String,
    Description: String,
    Images: [String]
});

module.exports = mongoose.model("album", album);