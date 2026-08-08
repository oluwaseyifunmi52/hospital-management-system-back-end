import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './env';

dns.setServers(['8.8.8.8', '8.4.4.8']);

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
