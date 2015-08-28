
let mongoose = require("mongoose");
let bcrypt = require("bcrypt-nodejs");

let superUserSchema = mongoose.Schema({
    user: {
        username: String,
        password: String
    }
});

superUserSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

superUserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.user.password);
};

module.exports = mongoose.model("superUser", superUserSchema);