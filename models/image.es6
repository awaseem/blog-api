
import mongoose from "mongoose";

let image = mongoose.Schema({
    name: String,
    url: String,
    description: String,
    group: String
});

let imageModel = mongoose.model("image", image);

export { imageModel };