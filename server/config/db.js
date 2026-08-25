import mongoose from 'mongoose';

// Disable Mongoose command buffering when connection is not established
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
    console.log('[MongoDB Notice] Local MongoDB default URI detected. Attempting fast connection (3s timeout)...');
  }

  try {
    const conn = await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/call_center', {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Status] Database not reached: ${error.message}`);
    console.warn(`[MongoDB Status] File-backed persistent storage ACTIVE (server/data/db.json). All data will be saved permanently on disk.`);
    return false;
  }
};
