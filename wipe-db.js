const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://DivAdmin:dadusai123@ac-5tauxds-shard-00-00.w3tdvnr.mongodb.net:27017,ac-5tauxds-shard-00-01.w3tdvnr.mongodb.net:27017,ac-5tauxds-shard-00-02.w3tdvnr.mongodb.net:27017/p2p-clothing-rental?ssl=true&replicaSet=atlas-uwqn9e-shard-0&authSource=admin&retryWrites=true&w=majority";

async function wipeDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    for (const name of collectionNames) {
      console.log(`Clearing collection: ${name}`);
      await mongoose.connection.db.collection(name).deleteMany({});
    }

    console.log('Database wipe complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error during wipe:', err);
    process.exit(1);
  }
}

wipeDatabase();

