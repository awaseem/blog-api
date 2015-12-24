import request from "supertest";
import mongoose from "mongoose";
import database from "../config/database";
import { blogModel } from "../models/blog";
import { superuserModel } from "../models/superuser";
import message from "../messages/blogApiMessages";
import app from "../app.js";

let token = "";

let blogId = "";

let BLOG_API_ROUTE = "/api/blog";

let clearDB = function() {
    for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function() {});
    }
};

describe("Test Blog Api", () => {

    before(function(done) {
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(database.testing ? database.testing : "mongodb://127.0.0.1");
        }
        let testSuperUser = new superuserModel();

        testSuperUser.user.username = "test";
        testSuperUser.user.password = testSuperUser.generateHash("test");
        testSuperUser.user.firstname = "test";
        testSuperUser.user.lastname = "test";
        testSuperUser.group.name = "test";
        testSuperUser.group.description = "test";

        testSuperUser.save((err) => {
            if (err) {
                clearDB();
                return done(err);
            }
            else {
                return done();
            }
        });
    });

    after((done) => {
        clearDB();
        mongoose.disconnect();
        return done();
    });

    it("should get a proper access token", (done) => {
        request(app)
        .post("/api/user/signin")
        .send({
            username: "test",
            password: "test"
        })
        .expect(function (res) {
            token = res.body.token;
        })
        .end(done);
    });

    it("should fail to add a blog without a token", (done) => {
        request(app)
        .post(BLOG_API_ROUTE)
        .send({
            heading: "test",
            body: "test"
        })
        .expect(403, done);
    });

    it("should fail to add blog without a heading", (done) => {
        request(app)
        .post(BLOG_API_ROUTE)
        .send({
            token: token,
            body: "test"
        })
        .expect(400, { message: message.invalidParameters }, done);
    });

    it("should fail to add blog without a body", (done) => {
        request(app)
        .post(BLOG_API_ROUTE)
        .send({
            token: token,
            heading: "test"
        })
        .expect(400, { message: message.invalidParameters }, done);
    });

    it("should add blog with heading, body, group and proper author", (done) => {
        request(app)
        .post(BLOG_API_ROUTE)
        .send({
            token: token,
            heading: "test",
            body: "test"
        })
        .expect((res) => {
            let newBlog = res.body.data;
            if ( newBlog.heading !== "test" && newBlog.body !== "test" && newBlog.author !== "test test") {
                throw new Error(`The message did not get stored properly, here is the message that was stored in the database: ${newBlog}`);
            }
            else {
                blogId = newBlog._id;
            }
        })
        .end(done);
    });

    it("should fail to update blog entry without a token", (done) => {
        request(app)
        .put(BLOG_API_ROUTE)
        .send({
            heading: "test changed",
            body: "test changed"
        })
        .expect(403, done);
    });

    it("should fail to update blog entry without an id", (done) => {
        request(app)
        .put(BLOG_API_ROUTE)
        .send({
            token: token,
            heading: "test changed",
            body: "test changed"
        })
        .expect(400, { message: message.noIdForUpdate }, done);
    });

    it("should fail to update blog entry without the correct id", (done) => {
        request(app)
        .put(BLOG_API_ROUTE)
        .send({
            token: token,
            id: "test",
            heading: "test changed",
            body: "test changed"
        })
        .expect(500, { message: message.serverFailedFindBlog }, done);
    });

    it("should update the heading", (done) => {
        let expectedHeading = "test changed";
        request(app)
        .put(BLOG_API_ROUTE)
        .send({
            token: token,
            id: blogId,
            heading: expectedHeading,
        })
        .expect((res) => {
            let newBlog = res.body.data;
            if (newBlog.heading !== expectedHeading) {
                throw new Error(`failed to update the blog entry, the following is expected: ${expectedHeading}, but got ${newBlog.heading}`);
            }
        })
        .end(done);
    });

    it("should update the body", (done) => {
        let expectedBody = "test changed";
        request(app)
        .put(BLOG_API_ROUTE)
        .send({
            token: token,
            id: blogId,
            body: expectedBody,
        })
        .expect((res) => {
            let newBlog = res.body.data;
            if (newBlog.body !== expectedBody) {
                throw new Error(`failed to update the blog entry, the following is expected: ${expectedBody}, but got ${newBlog.heading}`);
            }
        })
        .end(done);
    });

    it("should update the body and the heading", (done) => {
        let expectedHeading = "test";
        let expectedBody = "test";
        request(app)
        .put(BLOG_API_ROUTE)
        .send({
            token: token,
            id: blogId,
            heading: expectedHeading,
            body: expectedBody
        })
        .expect((res) => {
            let newBlog = res.body.data;
            if (newBlog.body !== expectedBody && newBlog.heading !== expectedHeading) {
                throw new Error(`failed to update the blog entry, the following is expected: ${expectedBody} ${expectedHeading}, but got ${newBlog.heading} ${newBlog.body}`);
            }
        })
        .end(done);
    });

    it("should fail to delete without a token", (done) => {
        request(app)
        .delete(BLOG_API_ROUTE)
        .send({
            id: blogId
        })
        .expect(403, done);
    });

    it("should fail to delete without an id", (done) => {
        request(app)
        .delete(BLOG_API_ROUTE)
        .send({
            token: token
        })
        .expect(400, { message: message.noIdForDeletion }, done);
    });

    it("should fail to delete without a correct id", (done) => {
        request(app)
        .delete(BLOG_API_ROUTE)
        .send({
            token: token,
            id: "test"
        })
        .expect(500, { message: "Error: failed to delete " }, done);
    });

    it("should delete the blog with the id given", (done) => {
        request(app)
        .delete(BLOG_API_ROUTE)
        .send({
            token: token,
            id: blogId
        })
        .expect(200, done);
    });
});
