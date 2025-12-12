import mongoose from "mongoose";

const connectDB = async() => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('ATLAS_URI loaded:', process.env.ATLAS_URI ? 'Yes' : 'No');

        mongoose.connection.on('connected', () => console.log("Database connected successfully"));
        mongoose.connection.on('error', (err) => console.error('Database connection error:', err));

        await mongoose.connect(process.env.ATLAS_URI);
        console.log('MongoDB connection established');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
}

export default connectDB;