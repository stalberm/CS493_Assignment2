const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

const MongoDB = require('../database');
const { ObjectId } = require('mongodb');
const reviewCollection = "reviews";
const reviews = require('../data/reviews');

exports.router = router;
exports.reviewCollection = reviewCollection;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
    userid: { required: true },
    businessid: { required: true },
    dollars: { required: true },
    stars: { required: true },
    review: { required: false }
};


/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
    if (validateAgainstSchema(req.body, reviewSchema)) {
        const review = extractValidFields(req.body, reviewSchema);
        const db = MongoDB.getInstance();
        const reviewColl = db.collection(reviewCollection);
        const query = { userid: review.userid, businessid: review.businessid };
        /*
         * Make sure the user is not trying to review the same business twice.
         */
        const count = await reviewColl.countDocuments(query);

        if (count) {
            res.status(403).json({
                error: "User has already posted a review of this business"
            });
        } else {
            const result = await reviewColl.insertOne(review);
            res.status(201).json({
                id: result.insertedId,
                links: {
                    review: `/reviews/${result.insertedId}`,
                    business: `/businesses/${review.businessid}`
                }
            });
        }

    } else {
        res.status(400).json({
            error: "Request body is not a valid review object"
        });
    }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async function (req, res, next) {
    let reviewID;
    try {
        reviewID = ObjectId.createFromHexString(req.params.reviewID);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid review ID"
        });
    }

    const db = MongoDB.getInstance();
    const reviewColl = db.collection(reviewCollection);
    const query = { _id: reviewID };

    const count = await reviewColl.countDocuments({});
    if (count === 0) {
        console.log("No reviews found");
        next();
    }
    try {
        const review = await reviewColl.findOne(query);
        if (review) {
            res.status(200).json(review);
        } else {
            next();
        }
    } catch (error) {
        console.error("Error", error);
        res.status(400).json({
            error: error
        });
    }
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
    let reviewID;
    try {
        reviewID = ObjectId.createFromHexString(req.params.reviewID);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid review ID"
        });
    }

    const db = MongoDB.getInstance();
    const reviewColl = db.collection(reviewCollection);
    const query = { _id: reviewID };

    const count = await reviewColl.countDocuments({});
    if (count === 0) {
        console.log("No reviews found");
        next();
    }
    if (validateAgainstSchema(req.body, reviewSchema)) {
        /*
         * Make sure the updated review has the same businessid and userid as
         * the existing review.
         */
        let updatedReview = extractValidFields(req.body, reviewSchema);
        try {
            const existingReview = await reviewColl.findOne(query);
            if (existingReview && updatedReview.businessid === existingReview.businessid && updatedReview.userid === existingReview.userid) {
                const result = await reviewColl.replaceOne(query, updatedReview);
                if (result.matchedCount === 1 && result.modifiedCount === 1) {
                    console.log("in");
                    res.status(200).json({
                        links: {
                            review: `/reviews/${reviewID}`,
                            business: `/businesses/${updatedReview.businessid}`
                        }
                    })
                } else {
                    next();
                }
            } else {
                res.status(403).json({
                    error: "Updated review cannot modify businessid or userid"
                });
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(400).json({
                error: error
            });
        }
    } else {
        res.status(400).json({
            error: "Request body is not a valid review object"
        });
    };
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async function (req, res, next) {
    let reviewID;
    try {
        reviewID = ObjectId.createFromHexString(req.params.reviewID);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid review ID"
        });
    }

    const db = MongoDB.getInstance();
    const reviewColl = db.collection(reviewCollection);
    const query = { _id: reviewID };

    const count = await reviewColl.countDocuments({});
    if (count === 0) {
        console.log("No reviews found");
        next();
    }

    try {
        const result = await reviewColl.deleteOne(qeury);
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            next();
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
});
