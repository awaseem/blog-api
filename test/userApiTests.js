import request from "supertest";
import mongoose from "mongoose";
import config from "nconf";
import { superuserModel } from "../models/superuser";
import message from "../messages/userApiMessages";
import app from "../app.js";

let SIGN_UP_API_ROUTE = "/api/user/signup";

let REMOVE_USER_API_ROUTE = "/api/user/removeUser";

let SIGN_IN_API_ROUTE = "/api/user/signin";

let clearDB = function() {
    for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
    }
};

describe("Test User Api for Sign Up", () => {

    before(function (done) {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(config.get("testingDatabase"), function (err) {
                if (err) {
                    throw err;
                }
                clearDB();
                return done();
            });
        } else {
            clearDB();
            return done();
        }
    });

    after(function (done) {
        clearDB();
        mongoose.disconnect();
        return done();
    });

    it("should fail with an empty body", (done) => {
        request(app)
        .post(SIGN_UP_API_ROUTE)
        .expect(400, { message: message.properParamsNotGiven }, done);
    });

    it("should fail with only a username given", (done) => {
        request(app)
        .post(SIGN_UP_API_ROUTE)
        .send({ usename: "test" })
        .expect(400, { message: message.properParamsNotGiven }, done);
    });

    it("should fail with only a username and password given", (done) => {
        request(app)
        .post(SIGN_UP_API_ROUTE)
        .send({
            username: "test",
            password: "test",
        })
        .expect(400, { message: message.properParamsNotGiven }, done);
    });

    it("should fail with only a username, password, firstname and lastname given", (done) => {
        request(app)
        .post(SIGN_UP_API_ROUTE)
        .send({
            username: "test",
            password: "test",
            firstname: "test",
            lastname: "test"
        })
        .expect(400, { message: message.properParamsNotGiven }, done);
    });

    it("should pass with all required parameters and create a new user", (done) => {
        request(app)
        .post(SIGN_UP_API_ROUTE)
        .send({
            username: "test",
            password: "test",
            firstname: "test",
            lastname: "test",
            groupName: "test"
        })
        .expect(200, { message: message.addedUserToDatabase }, done);
    });

    it("should fail to add user if the user already exists", (done) => {
        request(app)
        .post(SIGN_UP_API_ROUTE)
        .send({
            username: "test",
            password: "test",
            firstname: "test",
            lastname: "test",
            groupName: "test"
        })
        .expect(400, { message: message.usernameAlreadyExists }, done);
    });

});

describe("Test User Api for Remove", () => {

    before(function (done) {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(config.get("testingDatabase"));
            let testSuperUser = new superuserModel();

            testSuperUser.user.username = "test";
            testSuperUser.user.password = testSuperUser.generateHash("test");
            testSuperUser.user.firstname = "test";
            testSuperUser.user.lastname = "test";
            testSuperUser.group.name = "test";
            testSuperUser.group.description = "test";

            testSuperUser.save((err) => {
                if (err) {
                    return done(err);
                }
                else {
                    return done();
                }
            });
        } else {
            clearDB();
            return done();
        }
    });

    after(function (done) {
        clearDB();
        mongoose.disconnect();
        return done();
    });

    it("should fail with an empty body", (done) => {
        request(app)
        .post(REMOVE_USER_API_ROUTE)
        .expect(400, { message: message.invalidParameters }, done);
    });

    it("should fail with a username and no password", (done) => {
        request(app)
        .post(REMOVE_USER_API_ROUTE)
        .send({ username: "test" })
        .expect(400, { message: message.noPasswordGiven }, done);
    });

    it("should fail with a username and the wrong password", (done) => {
        request(app)
        .post(REMOVE_USER_API_ROUTE)
        .send({
            username: "test",
            password: "test_incorrect"
        })
        .expect(400, { message: message.authFailedPassword }, done);
    });

    it("should remove the user with the correct username and password", (done) => {
        request(app)
        .post(REMOVE_USER_API_ROUTE)
        .send({
            username: "test",
            password: "test"
        })
        .expect(200, { message: message.deletedUsername}, done);
    });
});

describe("Test User Api For Sign In", () => {

    before(function (done) {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(config.get("testingDatabase"));
            let testSuperUser = new superuserModel();

            testSuperUser.user.username = "test";
            testSuperUser.user.password = testSuperUser.generateHash("test");
            testSuperUser.user.firstname = "test";
            testSuperUser.user.lastname = "test";
            testSuperUser.group.name = "test";
            testSuperUser.group.description = "test";

            testSuperUser.save((err) => {
                if (err) {
                    return done(err);
                }
                else {
                    return done();
                }
            });
        } else {
            clearDB();
            return done();
        }
    });

    after(function (done) {
        clearDB();
        mongoose.disconnect();
        return done();
    });

    it("should fail if the post message body is empty", (done) => {
        request(app)
        .post(SIGN_IN_API_ROUTE)
        .expect(400, { message: message.invalidParameters }, done);
    });

    it("should fail if the post message only has a username", (done) => {
        request(app)
        .post(SIGN_IN_API_ROUTE)
        .send({ username: "test" })
        .expect(400, { message: message.noPasswordGiven }, done);
    });

    it("should fail if the username is correct, but the passsword is incorrect", (done) => {
        request(app)
        .post(SIGN_IN_API_ROUTE)
        .send({
            username: "test",
            password: "test_not_right"
        })
        .expect(400, { message: message.authFailedPassword }, done);
    });

    it("should fail if the username is incorrect, but the password is corrent", (done) => {
        request(app)
        .post(SIGN_IN_API_ROUTE)
        .send({
            username: "test_not_right",
            password: "test"
        })
        .expect(400, { message: message.authFailedUsername }, done);
    });

    it("should work with correct username and password", (done) => {
        request(app)
        .post(SIGN_IN_API_ROUTE)
        .send({
            username: "test",
            password: "test"
        })
        .expect(200, done);
    });
});
