
import mongoose from "mongoose";

let image = mongoose.Schema({
    name: String,
    url: String,
    description: String,
    group: String,
    imgurData: String,
    createdOn: Date
});

image.pre("save", function (next) {
    let now = Date.now();
    if (!this.createdOn) {
        this.createdOn = now;
    }
    next();
});

let imageModel = mongoose.model("image", image);

export { imageModel };