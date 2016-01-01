import config from "nconf";
import express from "express";
import jwt from "jsonwebtoken";
import message from "../messages/userApiMessages";
import { superuserModel } from "../models/superuser";
let router = express.Router();

/**
 * "/signin" POST used to obtain a token which allows you to modify data
 * parameters:
 * username (String): name of the user
 * password (String): password of the user
 */
router.post("/signin", (req, res) => {
    if (!req.body.username) {
        return res.status(400).json({ message: message.invalidParameters });
    }
    if (!req.body.password) {
        return res.status(400).json({ message: message.noPasswordGiven });
    }
    superuserModel.findOne({
        "user.username": req.body.username
    }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: message.databaseLookUpError });
        }
        if (!user) {
            return res.status(400).json({ message: message.authFailedUsername });
        }
        else if (user) {
            if (!user.validPassword(req.body.password)) {
                return res.status(400).json({ message: message.authFailedPassword });
            }
            else {
                let accessToken = jwt.sign( { userId: user._id, group: user.group.name, firstname: user.user.firstname, lastname: user.user.lastname }, config.get("tokenSecret"), {
                    expiresIn: config.get("tokenExp")
                });
                return res.json({ message: message.enjoyToken, token: accessToken });
            }
        }
    });
});

router.post("/removeUser", (req, res, next) => {
    if (!req.body.username) {
        return res.status(400).json({ message: message.invalidParameters });
    }
    if (!req.body.password) {
        return res.status(400).json({ message: message.noPasswordGiven });
    }
    superuserModel.findOne({
        "user.username": req.body.username
    }, (err, user) => {
        if (err) {
            return res.status(500).json({ message: message.databaseLookUpError });
        }
        if (!user) {
            return res.status(400).json({ message: message.authFailedUsername });
        }
        else if (user) {
            if (!user.validPassword(req.body.password)) {
                return res.status(400).json({ message: message.authFailedPassword });
            }
            else {
                superuserModel.findOneAndRemove({
                    "user.username": req.body.username
                }, (err) => {
                    if (err) {
                        return res.status(500).json({ message: message.databaseLookUpError });
                    }
                    else {
                        return res.json({ message: message.deletedUsername });
                    }
                });
            }
        }
    });
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
    if (req.body.username && req.body.password && req.body.groupName && req.body.firstname && req.body.lastname && req.body.signupSecret) {
        superuserModel.findOne({
            "user.username": req.body.username
        }, (err, user) => {
            if (err) {
                return res.status(500).json({ message: message.usernameDuplicateCheckFailed });
            }
            if (user) {
                return res.status(400).json({ message: message.usernameAlreadyExists });
            }
            if (req.body.signupSecret !== config.get("signupSecret")) {
                return res.status(400).json({ message: message.signupSecretIncorrect });
            }

            let newSuperUser = new superuserModel();

            newSuperUser.user.username = req.body.username;
            newSuperUser.user.password = newSuperUser.generateHash(req.body.password);
            newSuperUser.user.firstname = req.body.firstname;
            newSuperUser.user.lastname = req.body.lastname;
            newSuperUser.group.name = req.body.groupName;
            newSuperUser.group.description = req.body.groupDescription;

            newSuperUser.save((err) => {
                if (err) {
                    return res.status(500).json({ message: message.serverFailedToAddUser });
                }
                else {
                    return res.json({ message: message.addedUserToDatabase });
                }
            });
        });
    }
    else {
        return res.status(400).json({ message: message.properParamsNotGiven });
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
        jwt.verify(token, config.get("tokenSecret"), (err) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.json({ message: message.tokenIsProper });
        });
    }
    else {
        return res.status(403).json({ message: message.tokenIsNotProper });
    }
});

export { router };
