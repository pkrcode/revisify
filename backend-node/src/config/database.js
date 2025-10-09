import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB database.
 * @param {string} mongoURI - The connection string for the MongoDB instance.
 */
const connectDB = async (mongoURI) => {
  try {
    // Mongoose.connect returns a promise. We await its completion.
    // Modern versions of Mongoose (v6+) handle connection options by default,
    // so the configuration is much cleaner.
    await mongoose.connect(mongoURI);

  } catch (error) {
    // If an error occurs during connection, log it and re-throw to be caught by the caller.
    console.error('Database connection failed:', error.message);
    // This will be caught by the try/catch block in app.js, which will then exit the process.
    throw error;
  }
};

export default connectDB;