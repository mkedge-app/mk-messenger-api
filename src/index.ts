import app from './app';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const API_PORT = process.env.PORT;

class Server {
  start(): void {
    try {
      app.listen(API_PORT);
      logger.info(`Server is running on port ${API_PORT}`);
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1); // Encerra o processo com código de erro
    }
  }
}

const server = new Server();
server.start();
