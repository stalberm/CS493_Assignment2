const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');

const MongoDB = require('../database');
const { ObjectId } = require('mongodb');
const photoCollection = "photos";

exports.photoCollection = photoCollection;
exports.router = router;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
    userid: { required: true },
    businessid: { required: true },
    caption: { required: false }
};


/*
 * Route to create a new photo.
 */
router.post('/', async function (req, res, next) {
    if (validateAgainstSchema(req.body, photoSchema)) {
        const photo = extractValidFields(req.body, photoSchema);
        const db = MongoDB.getInstance();
        const photoColl = db.collection(photoCollection);
        const result = await photoColl.insertOne(photo);
        res.status(201).json({
            id: result.insertedId,
            links: {
                photo: `/photos/${result.insertedId}`,
                business: `/businesses/${photo.businessid}`
            }
        });
    } else {
        res.status(400).json({
            error: "Request body is not a valid photo object"
        });
    }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
    let photoID;
    try {
        photoID = ObjectId.createFromHexString(req.params.photoID);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid photo ID"
        });
    }

    const db = MongoDB.getInstance();
    const photoColl = db.collection(photoCollection);
    const query = { _id: photoID };

    const count = await photoColl.countDocuments({});
    if (count === 0) {
        console.log("No photos found");
        next();
    }
    try {
        const photo = await photoColl.findOne(query);
        if (photo) {
            res.status(200).json(photo)
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
 * Route to update a photo.
 */
router.put('/:photoID', async function (req, res, next) {

    let photoID;
    try {
        photoID = ObjectId.createFromHexString(req.params.photoID);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid photo ID"
        });
    }
    const db = MongoDB.getInstance();
    const photoColl = db.collection(photoCollection);
    const query = { _id: photoID };

    const count = await photoColl.countDocuments({});
    if (count === 0) {
        console.log("No photos found");
        next();
    }
    if (validateAgainstSchema(req.body, photoSchema)) {
        /*
         * Make sure the updated photo has the same businessid and userid as
         * the existing photo.
         */
        const updatedPhoto = extractValidFields(req.body, photoSchema);
        try {
            const existingPhoto = await photoColl.findOne(query);
            if (existingPhoto && updatedPhoto.businessid === existingPhoto.businessid && updatedPhoto.userid === existingPhoto.userid) {
                const result = await photoColl.replaceOne(query, updatedPhoto);
                if (result.matchedCount === 1 && result.modifiedCount === 1) {
                    res.status(200).json({
                        links: {
                            photo: `/photos/${photoID}`,
                            business: `/businesses/${updatedPhoto.businessid}`
                        }
                    });
                } else {
                    next();
                }
            } else {
                res.status(403).json({
                    error: "Updated photo cannot modify businessid or userid"
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
            error: "Request body is not a valid photo object"
        });
    };
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', async function (req, res, next) {

    let photoID;
    try {
        photoID = ObjectId.createFromHexString(req.params.photoID);
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: "Invalid photo ID"
        });
    }
    const db = MongoDB.getInstance();
    const photoColl = db.collection(photoCollection);
    const query = { _id: photoID };

    const count = await photoColl.countDocuments({});
    if (count === 0) {
        console.log("No photos found");
        next();
    }

    try {
        const result = await photoColl.deleteOne(query);
        if (result.deletedCount === 1) {
            res.status(204).end();
        } else {
            next();
        }
    } catch (error) {
        console.error("Error:", error);
    }
});
