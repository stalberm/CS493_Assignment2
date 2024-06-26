const express = require('express');
const morgan = require('morgan');
const MongoDB = require('./database');

const mongoHost = "database"; //localhost when running npm start locally
const mongoPort = 27017;
const mongoUser = process.env.API_MONGO_USERNAME || "api-user";
const mongoPassword = process.env.API_MONGO_PASSWORD || "somepass";
const mongoDBName = process.env.MONGO_DATABASE_NAME || "my-database";

const mongoURL =
    `mongodb://${mongoUser}:${mongoPassword}@` +
    `${mongoHost}:${mongoPort}/${mongoDBName}`;

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api);

app.use('*', function (req, res, next) {
    res.status(404).json({
        error: "Requested resource " + req.originalUrl + " does not exist"
    });
});

/*
 * This route will catch any errors thrown from our API endpoints and return
 * a response with a 500 status to the client.
 */
app.use('*', function (err, req, res, next) {
    console.error("== Error:", err)
    res.status(500).send({
        err: "Server error. Please try again later."
    })
})

async function initializeDatabase() {
    await MongoDB.init(mongoURL, mongoDBName)
    const adminUser = {
        name: "Test Admin",
        email: "admin@example.com",
        password: "$2a$08$Y00/JO/uN9n0dHKuudRX2eKksWMIHXDLzHWKuz/K67alAYsZRRike",
        admin: true
    }
    const db = MongoDB.getInstance();
    const results = await db.collection("users").insertOne(adminUser)
    console.log(results);
    app.listen(port, function () {
        console.log("== Server listening on port", port);
    });
}

initializeDatabase();