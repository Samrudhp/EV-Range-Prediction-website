const mongoose = require('mongoose')

require('dotenv').config();

exports.connectDB = async () => {
      try {
          await mongoose.connect(process.env.MONGO_URL);
          console.log('MongoDB Connected');
      } catch (error) {
          console.error('MongoDB Connection Error:', error);
          process.exit(1);
      }
  };
