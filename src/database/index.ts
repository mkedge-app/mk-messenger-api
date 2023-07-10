import mongoose from 'mongoose';
import logger from '../logger';

import MONGO_DB_URL from '../config/mongodb';

class Database {
  mongoConnection: typeof mongoose | undefined;

  constructor() {
    this.mongo();
  }

  async mongo(): Promise<void> {
    logger.info('Connecting to MongoDB...');

    try {
      this.mongoConnection = await mongoose.connect(MONGO_DB_URL, {
        connectTimeoutMS: 5000, // Timeout da conexão (5 segundos)
        socketTimeoutMS: 30000, // Timeout das operações de soquete (30 segundos)
      });

      logger.info('Connected to MongoDB successfully');
    } catch (error) {
      logger.error(`Connection Error: ${error}`);
    }
  }
}

export default new Database();
