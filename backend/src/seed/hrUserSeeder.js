const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const User = require('../models/User');
const Employee = require('../models/Employee');

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

  const user = await User.findOneAndUpdate(
    { email: userSeed.email },
    {
      $set: {
        name: userSeed.name,
        email: userSeed.email.toLowerCase(),
        password: passwordHash,
        role: role._id,
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );

  // Seed the corresponding Employee discriminator document if it doesn't exist
  let employee = await Employee.findOne({ email: userSeed.email });

  if (!employee) {
    // Determine the discriminator model to use
    let EmployeeModel;
    let employeeData = {
      firstName: userSeed.name.split(' ')[0] || userSeed.key,
      lastName: userSeed.name.split(' ').slice(1).join(' ') || 'Admin',
      email: userSeed.email.toLowerCase(),
      status: 'active',
      userId: user._id,
    };

    if (userSeed.roleName === 'Super Admin') {
      EmployeeModel = Employee.Admin;
      employeeData.employeeCode = 'EMP-ADMIN';
      employeeData.adminLevel = 1;
    } else if (userSeed.roleName === 'HR') {
      EmployeeModel = Employee.HR;
      employeeData.employeeCode = 'EMP-HR';
      employeeData.hrSpecialization = 'Generalist';
    } else {
      EmployeeModel = Employee;
      employeeData.employeeCode = `EMP-${userSeed.key}`;
    }

    employee = await EmployeeModel.create(employeeData);
    console.log(`${userSeed.key} employee profile created`);
  } else {
    // If the Employee profile already exists, ensure it is linked to the User
    if (!employee.userId) {
      employee.userId = user._id;
      await employee.save();
    }
  }

  // Update the User document with the employeeId ref
  if (!user.employeeId || !user.employeeId.equals(employee._id)) {
    user.employeeId = employee._id;
    await user.save();
  }

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