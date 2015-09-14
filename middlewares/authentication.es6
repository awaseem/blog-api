import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt"

let auth = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, jwtConfig.secret, (err, decoded) => {
            if (err) {
                return res.status(500).json(err);
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        return res.status(403).json({ message: "Yo buddy guy you need a token!!!"});
    }
};

export { auth };