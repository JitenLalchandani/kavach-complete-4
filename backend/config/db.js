const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.error(
      '[MongoDB] Make sure MONGO_URI is set in your .env file and MongoDB is reachable.'
    );
    process.exit(1);
  }
};

module.exports = connectDB;
