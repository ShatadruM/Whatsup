import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // We will use a fallback string for local development if the .env isn't set
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/realtime_chat';
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;