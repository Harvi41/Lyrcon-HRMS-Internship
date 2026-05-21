#!/usr/bin/env node
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!uri) {
  console.error('ERROR: MONGODB_URI not found in .env');
  process.exit(1);
}

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    const cols = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:');
    cols.forEach(c => console.log(' -', c.name));

    const wantEmployees = process.argv.includes('--employees') || process.argv.includes('--all');
    const wantUsers = process.argv.includes('--users') || process.argv.includes('--all');

    if (wantEmployees) {
      console.log('\nFetching up to 50 documents from `employees` collection...');
      const docs = await mongoose.connection.db.collection('employees').find({}).limit(50).toArray();
      console.log(`Found ${docs.length} documents (showing first ${Math.min(docs.length, 50)}):`);
      console.dir(docs, { depth: 2 });
    }

    if (wantUsers) {
      console.log('\nFetching up to 50 documents from `users` collection...');
      const docs = await mongoose.connection.db.collection('users').find({}).limit(50).toArray();
      console.log(`Found ${docs.length} documents (showing first ${Math.min(docs.length, 50)}):`);
      console.dir(docs, { depth: 2 });
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Script error:', err.message || err);
    process.exit(2);
  }
})();
