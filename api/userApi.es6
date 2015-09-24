import { superuserModel } from "../models/superuser";
import jwtConfig from "../config/jwt";
import express from "express";
import jwt from "jsonwebtoken";
let router = express.Router();

/**
 * "/signin" POST used to obtain a token which allows you to modify data
 * parameters:
 * username (String): name of the user
 * password (String): password of the user
 */
router.post("/signin", (req, res) => {
    if (!req.body.username) {
        return res.status(400).json({ message: "Error: No user given!"});
    }
    if (!req.body.password) {
        return res.status(400).json({ message: "Error: no password given!"});
    }
    superuserModel.findOne({
        "user.username": req.body.username
    }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: "Error occurred while finding user"});
        }
        if (!user) {
            return res.status(400).json({ message: "Auth Failed: could not find user"});
        }
        else if (user) {
            if (!user.validPassword(req.body.password)) {
                return res.status(400).json({ message: "Auth Failed: wrong password"});
            }
            else {
                let accessToken = jwt.sign( { userId: user._id, group: user.group.name }, jwtConfig.secret, {
                    expiresInMinutes: jwtConfig.tokenExp
                });

                return res.json({ message: "Enjoy the token!", token: accessToken });
            }
        }
    })
});

/**
 * "signup" POST used to create new users
 * parameters:
 * username (String): name of user
 * password (String): password of user
 * groupName (String): name of group they belong to
 * groupDescription (String): summary of group
 */
router.post("/signup", (req, res) => {
    if (req.body.username && req.body.password && req.body.groupName && req.body.groupDescription) {
        superuserModel.findOne({
            "user.username": req.body.username
        }, (err, user) => {
            if (err) {
                return res.status(500).json({ message: "Error: server barfed when trying to check username duplicates"});
            }
            if (user) {
                return res.status(400).json({ message: "Error: username already exists!"});
            }
            if (!req.body.groupName || !req.body.groupDescription) {
                return res.status(400).json({ message: "Error: group or group description not given"});
            }
            let newSuperUser = new superuserModel();
            newSuperUser.user.username = req.body.username;
            newSuperUser.user.password = newSuperUser.generateHash(req.body.password);
            newSuperUser.group.name = req.body.groupName;
            newSuperUser.group.description = req.body.groupDescription;

            newSuperUser.save((err) => {
                if (err) {
                    return res.status(500).json({ message: "Error: failed to add user!"});
                }
                else {
                    return res.json({ message: "Added user to database!" });
                }
            })
        });
    }
    else {
        return res.status(400).json({ message: "Error: you're missing parameters that are required to sign up"});
    }
});

/**
 * "checkToken" POST used to create new users
 * parameters:
 * token (String): token string to check
 */
router.post("/checkToken", (req, res) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, jwtConfig.secret, (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.json({ message: "Token is good to go!"})
        });
    }
    else {
        return res.status(403).json({ message: "Yo buddy guy you need a token!!!"});
    }
});

export { router };