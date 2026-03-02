const mongoose = require('mongoose');
const { startCronJobs } = require('../services/cronService');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected ✅`);

    startCronJobs();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// 5. We export this function so server.js can use it.
module.exports = connectDB;