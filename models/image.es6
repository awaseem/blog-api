
import mongoose from "mongoose";

//TODO add verification for length and other various checks

let image = mongoose.Schema({
    name: String,
    url: String,
    description: String,
    group: String,
    imgurData: String
});

let imageModel = mongoose.model("image", image);

export { imageModel };