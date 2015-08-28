
let albumModel = require("../models/album");
let superuserModel = require("../models/superuser");
let jwtConfig = require("../config/jwt");
let express = require("express");
let jwt = require("jsonwebtoken");
let router = express.Router();

router.post("/auth", (req, res) => {
    if (!req.body.username) {
        return res.status(400).json({ message: "Error: No user given!"});
    }
    if (!req.body.password) {
        return res.status(400).json({ message: "Error: no password given!"})
    }
    superuserModel.findOne({
        "user.username": req.body.username
    }, (err, user) => {
        if (err) {
            return res.status(400).json({ message: "Error occurred while finding user"});
        }
        if (!user) {
            return res.status(400).json({ message: "Auth Failed: could not find user"});
        }
        else if (user) {
            if (!user.validPassword(req.body.password)) {
                return res.status(400).json({ message: "Auth Failed: wrong password"});
            }
            else {
                let accessToken = jwt.sign(user, jwtConfig.secret, {
                    expiresInMinutes: 10
                });

                return res.json({ message: "Enjoy the token!", token: accessToken });
            }
        }
    })
});

router.use((req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, jwtConfig.secret, (err, decoded) => {
            if (err) {
                return res.status(400).json({ message: "Error: Failed to authenticate token."})
            }
            else {
                req.decoded = decoded.user.username;
                next();
            }
        });
    }
    else {
        return res.status(403).json({ message: "Yo buddy guy you need a token!!!"});
    }
});

// Route just to test inserting data
router.post("/album", (req, res) => {
    if ( !req.body.title || !req.body.description || (!req.body.images && !Array.isArray(req.body.images))) {
        return res.status(400).json({ message: "Error: invalid parameters"});
    }
    let newAlbum = new albumModel();
    newAlbum.title = req.body.title;
    newAlbum.description = req.body.description;
    newAlbum.images = req.body.images;

    newAlbum.save((err) => {
        if (err) {
            return res
                .status(400)
                .json({ message: "Error: could not add album data to server"});
        }
        res.json( { message: "Added album", data: newAlbum});
    });
});

module.exports = router;