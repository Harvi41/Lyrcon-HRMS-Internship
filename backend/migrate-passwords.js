require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to MongoDB. Running password migration...');
    const result = await User.updateMany(
      { mustChangePassword: { $exists: false } },
      { $set: { mustChangePassword: false } }
    );
    console.log(`Migration complete. Updated ${result.modifiedCount} existing users.`);
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
