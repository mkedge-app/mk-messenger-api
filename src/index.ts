/**
 * Arquivo de inicialização da aplicação
 *
 * Este arquivo é responsável por iniciar a aplicação, estabelecer a conexão com o banco de dados
 * e iniciar o servidor HTTP e WebSocket.
 */

import dotenv from 'dotenv';
import AppServer from './app';
import Database from './database';
import logger from './logger';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

async function startApp() {
  // Obter a porta da variável de ambiente
  const port = process.env.PORT;

  // Verificar se a variável de ambiente PORT está definida
  if (!port) {
    logger.error('A variável de ambiente PORT não está definida. A inicialização da aplicação será interrompida.');
    process.exit(1); // Encerra a aplicação com código de erro (1)
  }

  try {
    // Conectar ao banco de dados
    const database = new Database();
    await database.connect();

    // Inicializar o servidor HTTP e WebSocket
    const appServer = new AppServer();
    appServer.start(Number(port));
  } catch (error: any) {
    // Tratar erros durante a inicialização
    logger.error(error.message);
    process.exit(1); // Encerra a aplicação com código de erro (1)
  }
}

// Iniciar a aplicação chamando a função startApp()
startApp();
