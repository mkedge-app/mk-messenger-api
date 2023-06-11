import app from './app';
import dotenv from 'dotenv';
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const API_PORT = process.env.PORT;

class Server {
  start(): void {
    try {
      app.listen(API_PORT);
      console.log(`Server is running on port ${API_PORT}`);
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1); // Encerra o processo com código de erro
    }
  }
}

const server = new Server();
server.start();
