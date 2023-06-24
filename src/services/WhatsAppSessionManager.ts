import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import logger from '../logger';
import WebSocket from 'ws';
import fs from 'fs-extra';
import path from 'path';

interface SocketMap {
  [name: string]: any;
}

class WhatsAppSessionManager {
  private socks: SocketMap = {};

  public async createSession(socket: WebSocket | undefined, name: string): Promise<void> {
    if (!name) {
      throw new Error("O nome da sessão é obrigatório");
    }

    // Carregar as informações de autenticação do arquivo
    const { state, saveCreds } = await useMultiFileAuthState(`tokens/${name}`);

    // Criar um novo socket WhatsApp
    const sock = makeWASocket({ printQRInTerminal: true, auth: state });

    // Registrar um ouvinte para atualizações das credenciais
    sock.ev.on('creds.update', (res) => {
      saveCreds();
    });

    // Registrar um ouvinte para atualizações de conexão
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

      if (connection === 'close') {
        if (statusCode === DisconnectReason.loggedOut) {
          logger.info('Conexão fechada devido a logout');
          const tokensFolderPath = this.resolveTokensFolderPath(name);
          this.deleteFolderRecursive(tokensFolderPath);
        } else if (statusCode === DisconnectReason.connectionLost) {
          logger.info('Conexão perdida');
          // Lógica específica para tratamento de conexão perdida
        } else if (statusCode === DisconnectReason.timedOut) {
          logger.info('Conexão expirada');
          // Lógica específica para tratamento de tempo limite
        } else if (statusCode === DisconnectReason.connectionClosed) {
          logger.info('Conexão fechada');
          // Lógica específica para tratamento de conexão fechada
        } else {
          logger.info('Conexão fechada com motivo desconhecido');
          this.createSession(socket, name);
        }
      } else if (connection === 'open') {
        logger.info('Conexão estabelecida');
        // Lógica para tratamento de conexão estabelecida
      }
    });

    // Adicionar o novo socket à lista de sockets ativos usando o nome como chave
    this.socks[name] = sock;

    // Se um socket foi fornecido, realizar ações específicas
    if (socket) {
      // Enviar status para o usuário que solicitou
      // ...
    }
  }

  private resolveTokensFolderPath(name: string): string {
    const tokensFolderPath = path.resolve(__dirname, '..', '..', 'tokens', name);
    return tokensFolderPath;
  }

  private deleteFolderRecursive(folderPath: string): void {
    fs.remove(folderPath)
      .then(() => {
        logger.info(`Pasta excluída com sucesso: ${folderPath}`);
      })
      .catch((error) => {
        logger.error(`Erro ao excluir pasta: ${error}`);
      });
  }

  public getActiveSocks(): SocketMap {
    return this.socks;
  }

  public async initSessions(): Promise<void> {
    const tokensFolder = path.resolve(__dirname, '..', '..', 'tokens');
    const folderNames = await fs.readdir(tokensFolder);

    for (const folderName of folderNames) {
      const sessionName = folderName;
      logger.info(`Iniciando sessão de ${sessionName}...`);
      await this.createSession(undefined, sessionName);
    }
  }
}

export default new WhatsAppSessionManager();
