const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in environment.');
  process.exit(1);
}

async function wipeAll() {
  await mongoose.connect(MONGODB_URI);
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const { name } of collections) {
    console.log('Dropping collection:', name);
    await mongoose.connection.db.dropCollection(name);
  }
  console.log('All collections dropped.');
  process.exit(0);
}

wipeAll().catch(e => {
  console.error(e);
  process.exit(1);
});
