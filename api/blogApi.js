import express from "express";
import commonRoute from "../common/commonRoutes";
import message from "../messages/blogApiMessages";
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

/**
 * "/:id" GET allows you to retrieve one blog item based on the database id
 */
router.get("/:id", (req, res) => {
     blogModel.findById(req.params.id, (err, results) => {
         if (err || !results) {
             return res.status(404).json({ message: `Error: could not find blog with id: ${req.params.id}`});
         }
         res.json(results);
     });
});

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
        return res.status(400).json({ message: message.invalidParameters });
    }
    let newblog = new blogModel();
    newblog.heading = req.body.heading;
    newblog.body = req.body.body;
    newblog.group = req.user.group;
    newblog.author = req.user.firstname + " " + req.user.lastname;

    newblog.save((err) => {
        if (err) {
            return res.status(500).json({ message: message.serverErrorAdd });
        }
        res.json( { message: message.addedBlog, data: newblog});
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
        return res.status(400).json({ message: message.noIdForUpdate });
    }
    blogModel.findById(blogId, (err, blog) => {
        if (err) {
            return res.status(500).json({ message: message.serverFailedFindBlog });
        }
        if (!blog) {
            return res.status(400).json({ message: message.noBlogForId });
        }
        if (req.body.heading) {
            blog.heading = req.body.heading;
        }
        if (req.body.body) {
            blog.body = req.body.body;
        }
        if (req.body.published) {
            blog.published = req.body.published;
        }
        blog.save((err) => {
            if (err) {
                return res.status(500).json({ message: message.failedToUpdate });
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
