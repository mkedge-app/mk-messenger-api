import mongoose from 'mongoose';
import logger from '../logger';
import bcrypt from 'bcrypt';
import AdminUserModel from '../app/models/AdminUser';

import MONGO_DB_URL from '../config/mongodb';

class Database {
  constructor() {}

  async connectAndCreateDefaultAdminUser(): Promise<void> {
    logger.info('[Database]: Connecting to MongoDB...');

    try {
      await mongoose.connect(MONGO_DB_URL, {
        connectTimeoutMS: 5000, // Timeout da conexão (5 segundos)
        socketTimeoutMS: 30000, // Timeout das operações de soquete (30 segundos)
      });

      logger.info('[Database]: Connected to MongoDB successfully');
      await this.createDefaultAdminUser();
    } catch (error: any) {
      logger.error(`[Database]: Connection Error: ${error.message}`);
      throw new Error('Failed to connect to the database. Check the database connection settings.');
    }
  }

  private async createDefaultAdminUser(): Promise<void> {
    try {
      const adminUser = await AdminUserModel.findOne({ username: process.env.DEFAULT_ADMIN_USERNAME });

      if (!adminUser) {
        const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD;
        if (plainPassword) { // Verifique se plainPassword não é undefined
          const hashedPassword = await bcrypt.hash(plainPassword, 10);

          await AdminUserModel.create({
            username: process.env.DEFAULT_ADMIN_USERNAME,
            password_hash: hashedPassword,
            email: 'admin@example.com',
            role: 'admin'
          });

          logger.info('Default admin user created successfully.');
        } else {
          logger.error('DEFAULT_ADMIN_PASSWORD is undefined.');
        }
      }
    } catch (error: any) {
      logger.error(`Error creating default admin user: ${error.message}`);
    }
  }
}

export default Database;
