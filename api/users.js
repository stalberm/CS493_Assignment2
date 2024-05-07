const router = require('express').Router();

const { businesses } = require('./businesses');
const { reviews } = require('./reviews');
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
    name: { required: true },
    businessid: { required: false },
};

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', function (req, res) {
    const userid = parseInt(req.params.userid);
    const userBusinesses = businesses.filter(business => business && business.ownerid === userid);
    res.status(200).json({
        businesses: userBusinesses
    });
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', function (req, res) {
    const userid = parseInt(req.params.userid);
    const userReviews = reviews.filter(review => review && review.userid === userid);
    res.status(200).json({
        reviews: userReviews
    });
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res) {

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
            const photos = await photoColl.find(query).toArray();
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
        const result = await userColl.insertOne(user);
        res.status(201).json({
            id: result.insertedId,
            links: {
                user: `/users/${result.insertedId}`,
            }
        });
    }

})
