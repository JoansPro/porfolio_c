const mongoose = require('mongoose');

const connectDB = async () => {
    console.log("URI:", process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
    if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI manquant !");
    process.exit(1);
    }
};

module.exports = connectDB;
