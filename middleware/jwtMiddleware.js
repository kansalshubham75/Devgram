const jwt = require('jsonwebtoken');
const config = require('config');
const jwtMiddleware = (req, res, next) => {
    var token = req.headers['x-auth-token'];
    if (!token) {
        res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        var decoded = jwt.verify(token,
            config.get('jwtSecret'));

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Invalid Token' });
    }
}

module.exports = jwtMiddleware;