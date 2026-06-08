require('dotenv').config();
const mongoose = require('mongoose');
const Payroll = require('./src/models/Payroll');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const res = await Payroll.updateMany(
    { paymentStatus: 'Draft' },
    { $set: { paymentStatus: 'Paid', paymentDate: new Date() } }
  );
  console.log('Updated:', res.modifiedCount);
  mongoose.disconnect();
}).catch(console.error);
