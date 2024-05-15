const jwt = require('jsonwebtoken');
const secretKey = 'SuperSecretKey2';
const { ObjectId } = require('mongodb');
const MongoDB = require('../database');


function generateAuthToken(userID) {
    const payload = { sub: userID };
    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}

function requireAuthentication(req, res, next) {
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');
    const token = authHeaderParts[0] === 'Bearer' ?
        authHeaderParts[1] : null;
    try {
        const payload = jwt.verify(token, secretKey);
        req.user = payload.sub;
        next();
    } catch (err) {
        res.status(401).json({
            error: "Invalid authentication token provided."
        });
    }
}

async function checkAdmin(req) {
    const db = MongoDB.getInstance();
    const userColl = db.collection("users");
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');
    const token = authHeaderParts[0] === 'Bearer' ?
        authHeaderParts[1] : null;

    if (token !== null) {
        try {
            const payload = jwt.verify(token, secretKey);
            const tokenId = ObjectId.createFromHexString(payload.sub);
            const query = { _id: tokenId };
            const user = await userColl.findOne(query);
            if (user) {
                return user.admin;
            }
        } catch (err) {
            return false;
        }
    }
    return false;
}

exports.checkAdmin = checkAdmin;
exports.requireAuthentication = requireAuthentication;
exports.generateAuthToken = generateAuthToken;
