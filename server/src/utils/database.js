import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      if (this.connection) {
        console.log('Database already connected');
        return this.connection;
      }

      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not defined');
      }

      console.log('Connecting to MongoDB...');
      
      this.connection = await mongoose.connect(mongoUri);

      console.log('MongoDB connected successfully');
      
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        this.connection = null;
      });

      return this.connection;
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        console.log('Database disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

export const dbConnection = new DatabaseConnection();
