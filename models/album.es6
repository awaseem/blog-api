
import mongoose from "mongoose";

//TODO add verification for length and other various checks

let album = new mongoose.Schema({
    title: String,
    createdOn: Date,
    description: String,
    images: [String],
    group: String
});

album.pre("save", function (next) {
    let now = Date.now();
    if (!this.createdOn) {
        this.createdOn = now;
    }
    next();
});

let albumModel = mongoose.model("album", album);

export { albumModel };