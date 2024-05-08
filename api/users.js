const router = require('express').Router();

const { businessCollection } = require('./businesses');
const { reviewCollection } = require('./reviews');
const { photoCollection } = require('./photos');

const MongoDB = require('../database');
const { ObjectId } = require('mongodb');
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const userCollection = "users";

exports.userCollection = userCollection;
exports.router = router;

/*
 * Schema describing required/optional fields of a makeshift user object
 */
const userSchema = {
    _id: { required: false },
    name: { required: true },
    businessid: { required: false },
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
    console.log(query);
    const count = await userColl.countDocuments({});
    if (count === 0) {
        console.log("No users found");
        next();
    }
    try {
        const user = await userColl.findOne(query);
        console.log(user);
        if (user) {
            console.log(user);
            const query = { userid: userid.toString() };
            console.log("Here");
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
        const db = MongoDB.getInstance();
        const userColl = db.collection(userCollection);
        if (user._id) {
            const newId = ObjectId.createFromHexString(user._id);
            user._id = newId;
        }
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
});
