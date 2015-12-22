import mongoose from "mongoose";

let blog = new mongoose.Schema({
    heading: String,
    createdOn: Date,
    body: String,
    author: String,
    group: String
});

blog.pre("save", function (next) {
    let now = Date.now();
    if (!this.createdOn) {
        this.createdOn = now;
    }
    next();
});

let blogModel = mongoose.model("blog", blog);

export { blogModel };
