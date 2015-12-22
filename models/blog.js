import mongoose from "mongoose";

let blog = new mongoose.Schema({
    heading: String,
    description: String,
    body: String,
    group: String
});

blog.pre("save", function (next) {
    let now = Date.now();
    if (!this.createdOn) {
        this.createdOn = now;
    }
    next();
});

let blogModel = mongoose.model("blog", album);

export { blogModel };
