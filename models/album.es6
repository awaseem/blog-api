
let mongoose = require("mongoose");

let album = new mongoose.Schema({
    title: String,
    createdOn: Date,
    description: String,
    images: [String]
});

album.pre("save", function (next) {
    let now = Date.now();
    if (!this.createdOn) {
        this.createdOn = now;
    }
    next();
});

module.exports = mongoose.model("album", album);