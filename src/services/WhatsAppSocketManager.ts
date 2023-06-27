import makeWASocket, { ConnectionState, DisconnectReason } from '@whiskeysockets/baileys';
import logger from '../logger';
import { Boom } from '@hapi/boom';

class WhatsAppSocketManager {
  private sockets: { [name: string]: any } = {};

  public createSocketWhatsApp(name: string, authState: any, saveCreds: () => void): void {
    logger.info(`Criando sessão para ${name}...`);
    const socketWhatsApp = makeWASocket({ printQRInTerminal: true, auth: authState });

    socketWhatsApp.ev.on('creds.update', () => {
      saveCreds();
    });

    logger.info(`Ouvindo o evento 'connection.update'para o WASocket de ${name}`);
    socketWhatsApp.ev.on('connection.update', (update) => {
      this.handleConnectionUpdate(name, update);
    });

    this.sockets[name] = socketWhatsApp;
  }

  private handleConnectionUpdate(name: string, update: Partial<ConnectionState>): void {
    logger.info(`Atualização de conexão do socket de ${name} recebida`);

    const { connection, lastDisconnect, qr } = update;
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

    if (connection === 'connecting') {
      logger.info('Status de conexão: Conectando...');
    }

    if (connection === undefined && 'qr' in update) {
      logger.info('QR code gerado');
      // Lógica para manipular o QR code
      return;
    }

    if (connection === 'close') {
      if (statusCode === DisconnectReason.loggedOut) {
        logger.info('Conexão fechada devido a logout');
        // Lógica para lidar com o logout
      } else if (statusCode === DisconnectReason.connectionLost) {
        logger.info('Conexão perdida');
        // Lógica para lidar com a perda de conexão
      } else if (statusCode === DisconnectReason.timedOut) {
        logger.info('Conexão expirada');
        // Lógica para lidar com o tempo limite de conexão
      } else if (statusCode === DisconnectReason.connectionClosed) {
        logger.info('Conexão fechada');
        // Lógica para lidar com o fechamento da conexão
      } else {
        logger.info('Conexão fechada com motivo desconhecido');
        // Lógica para lidar com o fechamento da conexão com motivo desconhecido
      }
    } else if (connection === 'open') {
      logger.info('Conexão estabelecida');
      // Lógica para lidar com a conexão estabelecida
    }
  }
}

export default WhatsAppSocketManager;
