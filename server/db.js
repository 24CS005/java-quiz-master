const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quiz-app';
        console.log(`Attempting to connect to MongoDB at: ${mongoUri}`);
        const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.warn('WARNING: MongoDB connection failed. Switching to In-Memory Mock DB.');
        console.warn(`Reason: ${error.message}`);
        return false;
    }
};

module.exports = connectDB;
