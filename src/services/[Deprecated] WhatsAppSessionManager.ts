import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import logger from '../logger';
import fs from 'fs-extra';
import path from 'path';
import { Subject } from 'rxjs';
import { QRCodeData } from '../types/WhatsAppApi';
import FileUtils from './FileUtils';

interface SocketMap {
  [name: string]: any;
}

class WhatsAppSessionManager {
  private socks: SocketMap = {};
  private qrCodeSubject: Subject<QRCodeData>;
  private fileUtils: FileUtils;

  constructor() {
    this.qrCodeSubject = new Subject<QRCodeData>();
    this.fileUtils = new FileUtils();
    logger.info('WhatsAppSessionManager inicializado');
  }

  /**
   * Restaura as sessões existentes a partir dos arquivos armazenados no diretório tokens.
   * Cria uma sessão para cada diretório não vazio encontrado.
   *
   * @returns Uma Promise que é resolvida quando todas as sessões foram inicializadas.
   */
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

  /**
   * Cria uma nova sessão do WhatsApp com base no nome fornecido.
   * A sessão é criada usando o estado de autenticação obtido do arquivo correspondente aos tokens da sessão.
   *
   * @param name O nome da sessão a ser criada.
   * @throws Um erro é lançado se o nome da sessão não for fornecido.
   * @returns Uma Promise que é resolvida quando a sessão é criada com sucesso.
   */
  public async createSession(name: string): Promise<void> {
    if (!name) {
      throw new Error("O nome da sessão é obrigatório");
    }

    const { state, saveCreds } = await useMultiFileAuthState(`tokens/${name}`);

    this.createSocketWhatsApp(name, state, saveCreds);
  }

  public getQrCodeObservable(): Subject<QRCodeData> {
    return this.qrCodeSubject;
  }

  /**
   * Cria um socket do WhatsApp e configura os eventos necessários.
   *
   * @param name - O nome da sessão.
   * @param authState - O estado de autenticação do WhatsApp.
   * @param saveCreds - Uma função para salvar as credenciais.
   */
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

  /**
   * Manipula as atualizações de conexão do socket do WhatsApp.
   *
   * @param name - O nome da sessão associada ao socket.
   * @param update - As informações da atualização de conexão.
   */
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

  /**
   * Manipula o evento de logout de uma sessão do WhatsApp.
   *
   * @param name - O nome da sessão que foi desconectada.
   */
  private handleLoggedOut(name: string): void {
    const tokensFolderPath = this.resolveTokensFolderPath(name);
    this.fileUtils.deleteFolderRecursive(tokensFolderPath);

    delete this.socks[name];
  }

  private resolveTokensFolderPath(name: string): string {
    const tokensFolderPath = path.resolve(__dirname, '..', '..', 'tokens', name);
    return tokensFolderPath;
  }
}

export default new WhatsAppSessionManager();
