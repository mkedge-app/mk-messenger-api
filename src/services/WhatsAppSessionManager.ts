import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import logger from '../logger';
import WebSocket from 'ws';

class WhatsAppSessionManager {
  private socks: any[] = [];

  public async createSession(socket: WebSocket) {
    // Carregar as informações de autenticação do arquivo
    const { state, saveCreds } = await useMultiFileAuthState('tokens/auth_info_baileys')

    // Criar um novo socket WhatsApp
    const sock = makeWASocket({ printQRInTerminal: true, auth: state });

    // Registrar um ouvinte para atualizações das credenciais
    sock.ev.on('creds.update', (res) => {
      saveCreds();
    })

    // Registrar um ouvinte para atualizações de conexão
    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;


      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.info('Conexão fechada devido a:', lastDisconnect?.error, ', reconectando:', shouldReconnect);

        // Reconectar se não foi desconectado por logout
        if (shouldReconnect) {
          this.createSession(socket);
        }
      } else if (connection === 'open') {
        logger.info('Conexão estabelecida');
      }
    });

    // Adicionar o novo socket à lista de sockets ativos
    this.socks.push(sock);
  }

  public getActiveSocks() {
    return this.socks;
  }
}

export default new WhatsAppSessionManager();
