import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import logger from '../logger';
import fs from 'fs-extra';
import path from 'path';
import { Subject } from 'rxjs';
import { QRCodeData } from '../types/WhatsAppApi';

interface SocketMap {
  [name: string]: any;
}

class WhatsAppSessionManager {
  private socks: SocketMap = {};
  private qrCodeSubject: Subject<QRCodeData>;

  constructor() {
    this.qrCodeSubject = new Subject<QRCodeData>();
    logger.info('WhatsAppSessionManager inicializado');
  }

  public async createSession(name: string): Promise<void> {
    if (!name) {
      throw new Error("O nome da sessão é obrigatório");
    }

    const { state, saveCreds } = await useMultiFileAuthState(`tokens/${name}`);

    this.createSocketWhatsApp(name, state, saveCreds);
  }

  private createSocketWhatsApp(name: string, authState: any, saveCreds: () => void): void {
    logger.info(`Criando sessão para ${name}...`);
    const socketWhatsApp = makeWASocket({ printQRInTerminal: true, auth: authState });

    // Assinar evento 'creds.update' para salvar as credenciais
    logger.info(`Evento 'creds.update' foi assinado para o socket pertencente a ${name}`);
    socketWhatsApp.ev.on('creds.update', () => {
      saveCreds();
    });

    // Assinar evento 'connection.update' para lidar com atualizações de conexão
    socketWhatsApp.ev.on('connection.update', (update) => {
      logger.info(`Evento 'connection.update' foi assinado para o socket pertencente a ${name}`);
      this.handleConnectionUpdate(name, update);
    });

    this.socks[name] = socketWhatsApp;
  }

  private handleConnectionUpdate(name: string, update: any): void {
    logger.info(`Atualização de conexão do socket de ${name} recebida`);

    const { connection, lastDisconnect, qr } = update;
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

    if (connection === 'connecting') {
      logger.info('Status de conexão: Conectando...');
    }

    if (connection === undefined && 'qr' in update) {
      logger.info('QR code gerado');
      this.qrCodeSubject.next({
        name,
        qrcode: qr
      });
      return;
    }

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
        this.createSession(name);
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

  public getQrCodeObservable(): Subject<QRCodeData> {
    return this.qrCodeSubject;
  }

  public async initSessions(): Promise<void> {
    logger.info('Restaurando sessões existentes...');
    const tokensFolder = path.resolve(__dirname, '..', '..', 'tokens');
    const folderNames = await fs.readdir(tokensFolder);

    for (const folderName of folderNames) {
      const sessionName = folderName;
      const sessionFolderPath = path.join(tokensFolder, sessionName);
      const sessionFolderContent = await fs.readdir(sessionFolderPath);

      if (sessionFolderContent.length > 0) {
        logger.info(`Iniciando sessão de ${sessionName}...`);
        await this.createSession(sessionName);
      } else {
        logger.info(`O diretório da sessão ${sessionName} está vazio. A sessão não será iniciada.`);
      }
    }
    logger.info('Restaurando sessões finalizou');
  }
}

export default new WhatsAppSessionManager();
