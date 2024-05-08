const { MongoClient } = require('mongodb');

let db;

// async function init(url, mongoDBName) {
//     console.log("Attemping to connect");
//     const client = await MongoClient.connect(url)
//     db = client.db(mongoDBName);
//     console.log("Initialized");
// }


//More precaution for failed connection because I got some weird compose order error...
async function init(url, mongoDBName) {
    while (true) {
        try {
            console.log("Attempting to connect");
            const client = await MongoClient.connect(url);
            db = client.db(mongoDBName);
            console.log("Initialized");
            break;
        } catch (error) {
            console.error("Connection failed:", error.message);
            console.log("Retrying in 2 seconds...");
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

function getInstance() {
    return db;
}

module.exports = {
    init,
    getInstance
};

