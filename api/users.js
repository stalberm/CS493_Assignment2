const router = require('express').Router();
const bcrypt = require('bcryptjs');

const { businessCollection } = require('./businesses');
const { reviewCollection } = require('./reviews');
const { photoCollection } = require('./photos');

const MongoDB = require('../database');
const { ObjectId } = require('mongodb');
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const e = require('express');
const { requireAuthentication, generateAuthToken, checkAdmin } = require('../lib/auth');
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
router.get('/:userid/businesses', requireAuthentication, async function (req, res, next) {

    const isAdmin = await checkAdmin(req);
    if (!isAdmin && req.user !== req.params.userid) {
        res.status(403).json({
            error: "Unauthorized to access the specified resource"
        });
    } else {
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
                return
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(400).json({
                error: error
            });
        }
    }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', requireAuthentication, async function (req, res, next) {

    const isAdmin = await checkAdmin(req);
    if (!isAdmin && req.user !== req.params.userid) {
        res.status(403).json({
            error: "Unauthorized to access the specified resource"
        });
    } else {
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
    }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', requireAuthentication, async function (req, res, next) {

    const isAdmin = await checkAdmin(req);
    if (!isAdmin && req.user !== req.params.userid) {
        res.status(403).json({
            error: "Unauthorized to access the specified resource"
        });
    } else {
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
    }
});

router.post('/', async function (req, res, next) {

    if (validateAgainstSchema(req.body, userSchema)) {
        const user = extractValidFields(req.body, userSchema);
        const passwordHash = await bcrypt.hash(user.password, 8);
        user.password = passwordHash;
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
                const isAdmin = await checkAdmin(req);
                if (isAdmin) {
                    user.admin = false;
                    const result = await userColl.insertOne(user);
                    res.status(201).json({
                        id: result.insertedId,
                        links: {
                            user: `/users/${result.insertedId}`,
                        }
                    });
                } else {
                    res.status(403).json({
                        error: "Unauthorized to access the specified resource"
                    });
                    return;
                }
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

router.get('/:userid', requireAuthentication, async function (req, res, next) {

    const isAdmin = await checkAdmin(req);
    if (!isAdmin && req.user !== req.params.userid) {
        res.status(403).json({
            error: "Unauthorized to access the specified resource"
        });
    } else {
        let userID;
        try {
            userID = ObjectId.createFromHexString(req.params.userid);
        } catch (error) {
            console.log("Error:", error);
            return res.status(400).json({
                error: "Invalid user ID"
            });
        }

        const db = MongoDB.getInstance();
        const userColl = db.collection(userCollection);
        const query = { _id: userID };

        const count = await userColl.countDocuments({});
        if (count === 0) {
            console.log("No reviews found");
            next();
        }
        try {
            const user = await userColl
                .find(query).project({ password: 0 }).next();
            if (user) {
                res.status(200).json(user);
            } else {
                next();
            }
        } catch (error) {
            console.error("Error", error);
            res.status(400).json({
                error: error
            });
        }
    }
})


router.post('/login', async function (req, res, next) {

    if (req.body && req.body.email && req.body.password) {
        try {
            const authenticated =
                await validateUser(req.body.email, req.body.password);
            if (authenticated) {
                const user = await getUserByEmail(req.body.email, false);
                console.log("USER", user);
                const token = generateAuthToken(user._id.toString());
                res.status(200).send({ token: token });
            } else {
                res.status(401).send({
                    error: "Invalid authentication credentials"
                });
            }
        } catch (error) {
            console.log(error);
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
    const user = await getUserByEmail(email, true);
    const authenticated = user &&
        await bcrypt.compare(password, user.password);
    return authenticated;
}

async function getUserByEmail(email, includePassword) {
    const projection = includePassword ? {} : { password: 0 };
    const db = MongoDB.getInstance();
    const userColl = db.collection(userCollection);
    const user = await userColl
        .find({ email: email }).project(projection).next();
    return user;
}

