
let allowCrossDomain = function(req, res, next) {

    // Right now I allow any website to talk to this API, this might need to change.....
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    next();
};

export { allowCrossDomain };