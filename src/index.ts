import dotenv from 'dotenv';
import AppServer from './app';
import Database from './database';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

async function startApp() {
  try {
    const database = new Database();
    await database.connect();

    const appServer = new AppServer();
    const port = 3000;
    appServer.start(port);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1); // Encerra a aplicação com código de erro (1)
  }
}

startApp();
