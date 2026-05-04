const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      console.error('Check your MongoDB Atlas IP whitelist and connection string!');
      process.exit(1);
    }
  }
};

module.exports = connectDB;