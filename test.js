const fs = require('fs');
const mongoose = require('mongoose');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const uriLine = envContent.split('\n').find(l => l.startsWith('MONGODB_URI='));
const uri = uriLine.substring('MONGODB_URI='.length).trim();

console.log("URI TO TEST:", uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 })
  .then(() => {
     console.log('✅ Connection Successful!');
     process.exit(0);
  })
  .catch(err => {
     console.error('❌ Connection Failed:', err.message);
     process.exit(1);
  });
