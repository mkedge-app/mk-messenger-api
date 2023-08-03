import mongoose from 'mongoose';
import logger from '../logger';
import bcrypt from 'bcrypt';
import AdminUserModel from '../app/models/AdminUser';

import MONGO_DB_URL from '../config/mongodb';

class Database {
  constructor() {}

  /**
   * Conecta ao banco de dados MongoDB e cria o usuário administrador padrão, se não existir.
   * @throws Um erro é lançado se houver problemas de conexão com o banco de dados.
   */
  async connectAndCreateDefaultAdminUser(): Promise<void> {
    logger.info('[Database] Connecting to MongoDB...');

    try {
      await mongoose.connect(MONGO_DB_URL, {
        connectTimeoutMS: 5000, // Timeout da conexão (5 segundos)
        socketTimeoutMS: 30000, // Timeout das operações de soquete (30 segundos)
      });

      logger.info('[Database] Connected to MongoDB successfully');
      await this.ensureDefaultAdminUser();
    } catch (error: any) {
      const errorMessage = `[Database] Connection Error: ${error.message}`;
      logger.error(errorMessage);
      throw new Error('Failed to connect to the database. Check the database connection settings.');
    }
  }

  /**
   * Garante que o usuário administrador padrão exista no banco de dados.
   */
  private async ensureDefaultAdminUser(): Promise<void> {
    try {
      const adminUser = await AdminUserModel.findOne({ username: process.env.DEFAULT_ADMIN_USERNAME });

      if (!adminUser) {
        const plainPassword = process.env.DEFAULT_ADMIN_PASSWORD;
        if (plainPassword) {
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
      const errorMessage = `Error creating default admin user: ${error.message}`;
      logger.error(errorMessage);
    }
  }
}

export default Database;
