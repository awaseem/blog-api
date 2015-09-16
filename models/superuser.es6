
import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";

//TODO add verification for length and other various checks

let superUserSchema = mongoose.Schema({
    user: {
        username: String,
        password: String
    },
    group: {
        name: String,
        description: String
    }
});

superUserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

superUserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.user.password);
};

let superuserModel = mongoose.model("superUser", superUserSchema);

export { superuserModel };