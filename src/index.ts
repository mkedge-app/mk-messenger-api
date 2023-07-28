import dotenv from 'dotenv';
import App from './app';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

async function startApp() {
  const appServer = new App();
  await appServer.start();
}

startApp();
