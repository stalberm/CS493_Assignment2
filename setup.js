const { MongoClient } = require('mongodb');

const mongoHost = "database";
const mongoPort = 27017;
const mongoUser = process.env.API_MONGO_USERNAME || "api-user";
const mongoPassword = process.env.API_MONGO_PASSWORD || "somepass";
const mongoDBName = process.env.MONGO_DATABASE_NAME || "my-database";

const adminUser = process.env.MONGO_USERNAME || "admin";
const adminPassword = process.env.MONGO_PASSWORD || "admin";


const mongoURL =
    `mongodb://${adminUser}:${adminPassword}@` +
    `${mongoHost}:${mongoPort}/admin`;

async function main() {
    console.log("Executing setup");
    try {
        const client = await MongoClient.connect(mongoURL);

        console.log('Connected to MongoDB server');

        const db = client.db(mongoDBName);
        await db.command({
            createUser: mongoUser,
            pwd: mongoPassword,
            roles: [{ role: "readWrite", db: mongoDBName }]
        });

        await client.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
