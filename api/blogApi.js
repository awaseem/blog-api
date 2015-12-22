import jwtConfig from "../config/jwt";
import express from "express";
import jwt from "jsonwebtoken";
import commonRoute from "../common/commonRoutes";
import { blogModel } from "../models/blog";
import { superuserModel } from "../models/superuser";
import { auth } from "../middlewares/authentication";

let router = express.Router();

// Public routes

/**
 * "/" GET allows you to get all blogs in the database ordered by date.
 * They can be filtered out by group.
 * Each query is limited to 9 results, to get more simply pass the last results date to a new get request to retrieve the next 9.
 */
router.get("/", (req, res, next) => commonRoute.GET(req, res, next, blogModel));

// Private Api

router.use(auth);

/**
 * "/" POST allows you to add a new blog.
 * parameters:
 * Heading (String): name of blog
 * Body (String):  body of the blog
 */
router.post("/", (req, res) => {
    if ( !req.body.heading || !req.body.body ) {
        return res.status(400).json({ message: "Error: invalid parameters"});
    }
    let newblog = new blogModel();
    newblog.heading = req.body.heading;
    newblog.body = req.body.body;
    newblog.group = req.user.group;
    newblog.author = req.user.firstname + " " + req.user.lastname;

    newblog.save((err) => {
        if (err) {
            return res.status(500).json({ message: "Error: could not add blog data to server"});
        }
        res.json( { message: "Added blog", data: newblog});
    });
});

/**
 * "/" PUT allows you to update the blog based on what parameters are presented
 * parameters:
 * Id (String): Id for the blog to update
 * Heading (String, Optional): New heading for blog
 * Body (String, Optional): New body for blog
 */
router.put("/", (req, res) => {
    let blogId = req.body.id;
    if ( !blogId ) {
        return res.status(400).json({ message: "Error: no id given for blog update"});
    }
    blogModel.findById(blogId, (err, blog) => {
        if (err) {
            return res.status(500).json({ message: "Error: failed to find blog"});
        }
        if (!blog) {
            return res.status(400).json({ message: "Error: could not find blog with that ID"});
        }
        if (req.body.heading) {
            blog.heading = req.body.heading;
        }
        if (req.body.body) {
            blog.body = req.body.body;
        }
        blog.save((err) => {
            if (err) {
                return res.status(500).json({ message: "Error: failed to update blog" });
            }
            return res.json({ message: `Updated blog: ${blog._id}`, data: blog});
        });
    });
});

/**
 * "/" DELETE allows you to delete the blog based on what parameters are presented
 * parameters:
 * Id (String): Id for the blog to delete
 */
router.delete("/", (req, res, next) => commonRoute.DELETE(req, res, next, blogModel));

export { router };
