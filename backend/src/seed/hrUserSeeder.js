const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const User = require('../models/User');

const DEFAULT_USERS = [
  {
    key: 'HR',
    name: 'HR Admin',
    email: 'hr@lyrcon.com',
    password: 'HR@12345',
    roleName: 'HR',
  },
  {
    key: 'ADMIN',
    name: 'System Admin',
    email: 'admin@lyrcon.com',
    password: 'Admin@12345',
    roleName: 'Admin',
  },
];

const seedUser = async (userSeed) => {
  const role = await Role.findOne({ name: userSeed.roleName, isActive: true });

  if (!role) {
    console.log(`${userSeed.roleName} role not found, skipping ${userSeed.key} seed`);
    return;
  }

  const passwordHash = await bcrypt.hash(userSeed.password, 10);

  await User.findOneAndUpdate(
    { email: userSeed.email },
    {
      $set: {
        name: userSeed.name,
        email: userSeed.email,
        password: passwordHash,
        role: role._id,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );

  console.log(`${userSeed.key} login seeded: ${userSeed.email}`);
};

const seedHrUser = async () => {
  try {
    for (const userSeed of DEFAULT_USERS) {
      await seedUser(userSeed);
    }

    console.log('Default login accounts seeded');
  } catch (error) {
    console.error('HR user seeding error:', error.message);
  }
};

module.exports = seedHrUser;