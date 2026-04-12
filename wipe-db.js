const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://DivAdmin:dadusai123@ac-5tauxds-shard-00-00.w3tdvnr.mongodb.net:27017,ac-5tauxds-shard-00-01.w3tdvnr.mongodb.net:27017,ac-5tauxds-shard-00-02.w3tdvnr.mongodb.net:27017/p2p-clothing-rental?ssl=true&replicaSet=atlas-uwqn9e-shard-0&authSource=admin&retryWrites=true&w=majority";

async function wipeDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define models for wiping
    const UserSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
    const ListingSchema = new mongoose.Schema({}, { strict: false, collection: 'listings' });
    const OrderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Listing = mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

    // Delete all listings and orders
    const listingsCount = await Listing.deleteMany({});
    console.log(`Deleted ${listingsCount.deletedCount} listings`);

    const ordersCount = await Order.deleteMany({});
    console.log(`Deleted ${ordersCount.deletedCount} orders`);

    console.log('Database wipe complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error during wipe:', err);
    process.exit(1);
  }
}

wipeDatabase();
