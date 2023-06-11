import mongoose from 'mongoose';
import logger from '../logger';

import MONGO_DB_URL from '../app/config/mongodb';

class Database {
  mongoConnection: typeof mongoose | undefined;

  constructor() {
    this.mongo();
  }

  /**
   * Connects to MongoDB and then connects to the active tenants' databases.
   */
  async mongo(): Promise<void> {
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
