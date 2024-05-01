const { MongoClient } = require('mongodb');

let db;

async function init(url, mongoDBName) {
    console.log("Attemping to connect");
    const client = await MongoClient.connect(url)
    db = client.db(mongoDBName);
    console.log("Initialized");
}

function getInstance() {
    return db;
}

module.exports = {
    init,
    getInstance
};

