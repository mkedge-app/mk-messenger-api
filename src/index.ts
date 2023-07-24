import dotenv from 'dotenv';
import AppServer from './app';
import Database from './database';
import logger from './logger';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

async function startApp() {
  const port = process.env.PORT;

  if (!port) {
    logger.error('A variável de ambiente PORT não está definida. A inicialização da aplicação será interrompida.');
    process.exit(1); // Encerra a aplicação com código de erro (1)
  }

  try {
    const database = new Database();
    await database.connect();

    const appServer = new AppServer();
    appServer.start(Number(port));
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1); // Encerra a aplicação com código de erro (1)
  }
}

startApp();
