const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');


const MongoDB = require('../database');
const { ObjectId } = require('mongodb');
const e = require('express');
exports.router = router;


/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
    ownerid: { required: true },
    name: { required: true },
    address: { required: true },
    city: { required: true },
    state: { required: true },
    zip: { required: true },
    phone: { required: true },
    category: { required: true },
    subcategory: { required: true },
    website: { required: false },
    email: { required: false }
};

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res) {


    /*
     * Obtain a reference to the database
     * Query the businesses collection for all documents
     * Store results in a local array
     */

    const businesses = [];
    const db = MongoDB.getInstance();
    const businessesColl = db.collection("businesses");
    const query = {};

    try {
        const cursor = businessesColl.find(query);

        const count = await businessesColl.countDocuments(query);
        if (count === 0) {
            console.log("No businesses found");
            next();
        }

        await cursor.forEach(doc => {
            businesses.push(doc);
        });

        console.dir(businesses);
    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({
            error: error
        });
    }

    /*
     * Compute page number based on optional query string parameter `page`.
     * Make sure page is within allowed bounds.
     */

    let page = parseInt(req.query.page) || 1;
    const numPerPage = 10;
    const lastPage = Math.ceil(businesses.length / numPerPage);
    page = page > lastPage ? lastPage : page;
    page = page < 1 ? 1 : page;

    /*
     * Calculate starting and ending indices of businesses on requested page and
     * slice out the corresponsing sub-array of busibesses.
     */
    const start = (page - 1) * numPerPage;
    const end = start + numPerPage;
    const pageBusinesses = businesses.slice(start, end);

    /*
     * Generate HATEOAS links for surrounding pages.
     */
    const links = {};
    if (page < lastPage) {
        links.nextPage = `/businesses?page=${page + 1}`;
        links.lastPage = `/businesses?page=${lastPage}`;
    }
    if (page > 1) {
        links.prevPage = `/businesses?page=${page - 1}`;
        links.firstPage = '/businesses?page=1';
    }

    /*
     * Construct and send response.
     */
    res.status(200).json({
        businesses: pageBusinesses,
        pageNumber: page,
        totalPages: lastPage,
        pageSize: numPerPage,
        totalCount: businesses.length,
        links: links
    });
});

/*
 * Route to create a new business.
 */
router.post('/', async function (req, res, next) {
    if (validateAgainstSchema(req.body, businessSchema)) {
        const business = extractValidFields(req.body, businessSchema);
        const db = MongoDB.getInstance();
        const businessesColl = db.collection("businesses");
        const result = await businessesColl.insertOne(business);
        res.status(201).json({
            id: result.insertedId,
            links: {
                business: `/businesses/${result.insertedId}`
            }
        });
    } else {
        res.status(400).json({
            error: "Request body is not a valid business object"
        });
    }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async function (req, res, next) {
    const businessid = ObjectId.createFromHexString(req.params.businessid);
    const db = MongoDB.getInstance();
    const businessesColl = db.collection("businesses");
    const reviewsColl = db.collection("reviews");
    const photosColl = db.collection("photos");
    const query = { _id: businessid };

    const count = await businessesColl.countDocuments({});
    if (count === 0) {
        console.log("No businesses found");
        next();
    }
    try {
        const business = await businessesColl.findOne(query);
        console.dir(business);
        if (business) {
            const query = { businessid: businessid };
            const reviews = [];
            const photos = [];

            var cursor = reviewsColl.find(query);
            await cursor.forEach(reviewDoc => {
                reviews.push(reviewDoc);
            });
            cursor = photosColl.find(query);
            await cursor.forEach(photoDoc => {
                photos.push(photoDoc);
            });
            business.reviews = reviews;
            business.photos = photos;
            res.status(200).json(business);
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
 * Route to replace data for a business.
 */
router.put('/:businessid', async function (req, res, next) {
    const businessid = ObjectId.createFromHexString(req.params.businessid);
    const db = MongoDB.getInstance();
    const businessesColl = db.collection("businesses");
    const query = { _id: businessid };

    console.dir("HIT");
    const count = await businessesColl.countDocuments({});
    if (count === 0) {
        console.log("No businesses found");
        next();
    }
    if (validateAgainstSchema(req.body, businessSchema)) {
        const business = extractValidFields(req.body, businessSchema);
        try {
            const result = await businessesColl.replaceOne(query, business);
            if (result.matchedCount === 1 && result.modifiedCount === 1) {
                res.status(200).json({
                    links: {
                        business: `/businesses/${businessid}`
                    }
                });
            }
            else {
                next();
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(400).json({
                error: error
            });
        }
    } else {
        res.status(400).json({
            error: "Request body is not a valid business object"
        });
    }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', async function (req, res, next) {

    const businessid = ObjectId.createFromHexString(req.params.businessid);
    const db = MongoDB.getInstance();
    const businessesColl = db.collection("businesses");
    const query = { _id: businessid };

    const count = await businessesColl.countDocuments({});
    if (count === 0) {
        console.log("No businesses found");
        next();
    }

    try {
        const result = await businessesColl.deleteOne(query);
        if (result.deletedCount === 1) {
            res.status(204).end();
        }
        else {
            next();
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({
            error: error
        });
    }
});
