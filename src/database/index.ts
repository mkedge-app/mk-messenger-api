import mongoose from 'mongoose';
import logger from '../logger';

import MONGO_DB_URL from '../config/mongodb';

class Database {
  constructor() {}

  async connect(): Promise<void> {
    logger.info('[Database]: Connecting to MongoDB...');

    try {
      await mongoose.connect(MONGO_DB_URL, {
        connectTimeoutMS: 5000, // Timeout da conexão (5 segundos)
        socketTimeoutMS: 30000, // Timeout das operações de soquete (30 segundos)
      });

      logger.info('[Database]: Connected to MongoDB successfully');
    } catch (error: any) {
      logger.error(`[Database]: Connection Error: ${error.message}`);
      throw new Error('Failed to connect to the database. Check the database connection settings.');
    }
  }
}

export default Database;
