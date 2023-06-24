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

  public async createSession(socket: WebSocket, name: string | undefined): Promise<void> {
    if (name === undefined) {
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

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.info('Conexão fechada devido a:', lastDisconnect?.error, ', reconectando:', shouldReconnect);

        // Reconectar se não foi desconectado por logout
        if (shouldReconnect) {
          this.createSession(socket, name);
        }
      } else if (connection === 'open') {
        logger.info('Conexão estabelecida');
      }
    });

    // Adicionar o novo socket à lista de sockets ativos usando o nome como chave
    this.socks[name as string] = sock;
  }

  public getActiveSocks(): SocketMap {
    return this.socks;
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
}

export default new WhatsAppSessionManager();
