const fs = require('fs');
const mongoose = require('mongoose');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const uriLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
const uri = uriLine.substring('MONGODB_URI='.length).trim();

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 })
  .then(async () => {
    console.log('Connected to DB. Wiping collections specifically...');
    
    // Safely dropping the entire connected database payload instead of iterating collections
    try {
        await mongoose.connection.db.dropDatabase();
        console.log('✅ Database wiped successfully!');
        process.exit(0);
    } catch(e) {
        console.error('❌ Error wiping DB:', e);
        process.exit(1);
    }
  })
  .catch(err => {
     console.error('❌ Connection Failed:', err.message);
     process.exit(1);
  });
