const router = require('express').Router();
const bcrypt = require('bcryptjs');

const { businessCollection } = require('./businesses');
const { reviewCollection } = require('./reviews');
const { photoCollection } = require('./photos');

const MongoDB = require('../database');
const { ObjectId } = require('mongodb');
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const e = require('express');
const userCollection = "users";

exports.userCollection = userCollection;
exports.router = router;

/*
 * Schema describing required/optional fields of a makeshift user object
 */
const userSchema = {
    _id: { required: false },
    name: { required: true },
    email: { required: true },
    password: { required: true },
    admin: { required: false }
};

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res, next) {
    let userid;
    try {
        userid = ObjectId.createFromHexString(req.params.userid);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid user ID"
        });
    }
    const db = MongoDB.getInstance();
    const userColl = db.collection(userCollection);
    const businessColl = db.collection(businessCollection);
    const query = { _id: userid };

    const count = await userColl.countDocuments({});
    if (count === 0) {
        console.log("No users found");
        next();
    }
    try {
        const user = await userColl.findOne(query);
        if (user) {
            const query = { ownerid: userid.toString() };
            const businesses = await businessColl.find(query).toArray();
            res.status(200).json({
                businesses: businesses
            });
        } else {
            next();
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({
            error: error
        });
    }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async function (req, res, next) {

    let userid;
    try {
        userid = ObjectId.createFromHexString(req.params.userid);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid user ID"
        });
    }
    const db = MongoDB.getInstance();
    const userColl = db.collection(userCollection);
    const reviewColl = db.collection(reviewCollection);
    const query = { _id: userid };

    const count = await userColl.countDocuments({});
    if (count === 0) {
        console.log("No users found");
        next();
    }
    try {
        const user = await userColl.findOne(query);
        if (user) {
            const query = { userid: userid.toString() };
            const reviews = await reviewColl.find(query).toArray();
            res.status(200).json({
                reviews: reviews
            });
        } else {
            next();
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({
            error: error
        });
    }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res, next) {

    let userid;
    try {
        userid = ObjectId.createFromHexString(req.params.userid);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid user ID"
        });
    }
    const db = MongoDB.getInstance();
    const userColl = db.collection(userCollection);
    const photoColl = db.collection(photoCollection);
    const query = { _id: userid };
    const count = await userColl.countDocuments({});
    if (count === 0) {
        console.log("No users found");
        next();
    }
    try {
        const user = await userColl.findOne(query);
        if (user) {
            const query = { userid: userid.toString() };
            var photos = [];
            if (photoColl.countDocuments({})) {
                photos = await photoColl.find(query).toArray();
            }
            res.status(200).json({
                photos: photos
            });
        } else {
            next();
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({
            error: error
        });
    }
});

router.post('/', async function (req, res, next) {
    if (validateAgainstSchema(req.body, userSchema)) {
        const user = extractValidFields(req.body, userSchema);
        const passwordHash = await bcrypt.hash(user.password, 8);
        user.password = passwordHash;
        user.admin = false;
        const db = MongoDB.getInstance();
        const userColl = db.collection(userCollection);
        if (user._id) {
            const newId = ObjectId.createFromHexString(user._id);
            user._id = newId;
        }
        const emailExists = await userColl.countDocuments({ email: user.email }) > 0;
        if (emailExists) {
            res.status(400).json({
                error: "Email already in use"
            });
        } else {
            try {
                const result = await userColl.insertOne(user);
                res.status(201).json({
                    id: result.insertedId,
                    links: {
                        user: `/users/${result.insertedId}`,
                    }
                });
            } catch (error) {
                console.error("Error:", error);
                res.status(400).json({
                    error: error
                })
            }
        }
    } else {
        res.status(400).json({
            error: "Request body is not a valid user object"
        });
    }
});

router.post('/login', async function (req, res, next) {
    if (req.body && req.body.email && req.body.password) {
        try {
            const authenticated =
                await validateUser(req.body.email, req.body.password);
            if (authenticated) {
                res.status(200).send({});
            } else {
                res.status(401).send({
                    error: "Invalid authentication credentials"
                });
            }
        } catch (err) {
            console.log(err);
            res.status(500).send({
                error: "Error logging in.  Try again later."
            });
        }
    } else {
        res.status(400).json({
            error: "Request body needs user ID and password."
        });
    }
})

async function validateUser(email, password) {
    const user = await getUserByID(email, true);
    const authenticated = user &&
        await bcrypt.compare(password, user.password);
    return authenticated;
}

async function getUserByID(email, includePassword) {
    const projection = includePassword ? {} : { password: 0 };
    const db = MongoDB.getInstance();
    const userColl = db.collection(userCollection);
    const user = await userColl
        .find({ email: email }).project(projection).next();
    return user;
}

