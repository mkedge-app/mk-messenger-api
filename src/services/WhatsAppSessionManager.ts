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

    const { state, saveCreds } = await useMultiFileAuthState(`tokens/${name}`);

    const socketWhatsApp = await this.createSocketWhatsApp(name, state, saveCreds);

    this.socks[name] = socketWhatsApp;

    if (socket) {
      // Enviar status para o usuário que solicitou
      // ...
    }
  }

  private async createSocketWhatsApp(name: string, authState: any, saveCreds: () => void): Promise<any> {
    const socketWhatsApp = makeWASocket({ printQRInTerminal: true, auth: authState });

    socketWhatsApp.ev.on('creds.update', () => {
      saveCreds();
    });

    socketWhatsApp.ev.on('connection.update', (update) => {
      this.handleConnectionUpdate(name, update);
    });

    return socketWhatsApp;
  }

  private handleConnectionUpdate(name: string, update: any): void {
    const { connection, lastDisconnect, qr } = update;
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

    if (connection === 'close') {
      if (statusCode === DisconnectReason.loggedOut) {
        logger.info('Conexão fechada devido a logout');
        this.handleLoggedOut(name);
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
        this.createSession(undefined, name);
      }
    } else if (connection === 'open') {
      logger.info('Conexão estabelecida');
      // Lógica para tratamento de conexão estabelecida
    }
  }

  private handleLoggedOut(name: string): void {
    const tokensFolderPath = this.resolveTokensFolderPath(name);
    this.deleteFolderRecursive(tokensFolderPath);

    delete this.socks[name];
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
