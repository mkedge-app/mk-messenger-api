import WhatsAppSocketManager from './WhatsAppSocketManager';
import { Boom } from '@hapi/boom';
import logger from '../../logger';
import QRCode from 'qrcode';
import { DisconnectReason } from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import { QRCodeData } from '../../types/WhatsAppApi';

export interface Session {
  name: string;
  active: boolean;
}

class WhatsAppSessionManager {
  private socketManager: WhatsAppSocketManager;
  private sessions: Session[];
  private qrCodeSubject: Subject<QRCodeData>;
  private connectionEstablishedSubject: Subject<Session>;

  constructor() {
    this.socketManager = new WhatsAppSocketManager();
    this.qrCodeSubject = new Subject<QRCodeData>();
    this.connectionEstablishedSubject = new Subject<Session>();
    this.sessions = [];
  }

  public async initializeSession(name: string): Promise<void> {
    const existingSession = this.sessions.find(session => session.name === name);
    if (existingSession && existingSession.active) {
      const errorMessage = `A sessão ${name} já está ativa.`;
      logger.error(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }

    await this.socketManager.createSocketWhatsApp(name);
    this.listenToConnectionUpdates(name);

    return Promise.resolve();
  }

  private listenToConnectionUpdates(name: string): void {
    // Obtém o Observable de atualização de conexão para a sessão específica
    const connectionUpdateObservable = this.socketManager.getConnectionUpdateObservable(name);

    // Subscreve-se ao Observable para receber atualizações de conexão
    connectionUpdateObservable.subscribe((update) => {
      // Extrai as propriedades relevantes da atualização
      const { connection, lastDisconnect } = update;

      // Obtém o código de status do último desligamento, se disponível
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

      // Verifica se a conexão foi fechada
      if (connection === 'close') {
        // Verifica se a razão do fechamento foi logout
        if (statusCode === DisconnectReason.loggedOut) {
          // Remove a sessão do array de sessões
          const sessionToRemove = name;
          const updatedSessions = this.sessions.filter((session) => session.name !== sessionToRemove);
          this.sessions = updatedSessions;
        } else {
          // Atualiza a sessão como inativa
          this.updateSessionState(name, false);
        }
      }
      // Verifica se a conexão foi aberta
      else if (connection === 'open') {
        const session = { name, active: true };
        const existingSessionIndex = this.sessions.findIndex(s => s.name === name);

        if (existingSessionIndex !== -1) {
          // A sessão já existe no array, então atualize apenas o status
          this.updateSessionState(name, true);
        } else {
          // A sessão não existe no array, então adicione-a
          this.sessions.push(session);
        }

        // Notifica que a conexão foi estabelecida com sucesso
        this.connectionEstablishedSubject.next(session);
      }
      // Verifica se há um QR Code disponível na atualização
      else if ('qr' in update && update.qr) {
        QRCode.toDataURL(update.qr, (err, url) => {
          if (err) {
            logger.error('Erro ao converter QR Code:', err);
            return;
          }

          // Emite o QR Code para subscribers
          this.qrCodeSubject.next({ name, qrcode: url });
        });
      }
    });
  }

  handleWSClientDisconnection(name: string) {
    this.socketManager.handleWebSocketClientDisconnection(name);
  }

  public async restoreSessions(): Promise<void> {
    const sessionNames = await this.socketManager.getExistingSessionNames();
    for (const name of sessionNames) {
      logger.info(`[WhatsAppSessionManager] Restaurando sessão de ${name}`);
      this.initializeSession(name);
    }
  }

  private updateSessionState(name: string, active: boolean): void {
    this.sessions = this.sessions.map(session => {
      if (session.name === name) {
        return { ...session, active };
      }
      return session;
    });
  }

  public getQrCodeObservable(): Subject<QRCodeData> {
    return this.qrCodeSubject;
  }

  public getConnectionEstablishedObservable(): Subject<Session> {
    return this.connectionEstablishedSubject;
  }

  public getSessions(): Session[] {
    return this.sessions;
  }

  public getSessionByName(name: string): Session | undefined {
    return this.sessions.find(session => session.name === name);
  }

  public deleteSession(name: string) {
    this.socketManager.logoutSessionByName(name);
    const sessionToRemove = name;
    const updatedSessions = this.sessions.filter((session) => session.name !== sessionToRemove);
    this.sessions = updatedSessions;
  }

  public deactivateSession(name: string) {
    this.socketManager.deactivateSession(name);
    this.updateSessionState(name, false);
  }

  public async sendTextMessage(name: string, to: string, text: string) {
    const sentMessage = await this.socketManager.sendTextMessage(name, to, text);
    return sentMessage;
  }

  public async sendFileMessage(name: string, to: string, text: string) {
    console.log("WhatsAppSessionManager", "sendFileMessage");
    await this.socketManager.sendFileMessage(name, to, text);
  }

  public async sendImageMessage(name: string, to: string, text: string) {
    await this.socketManager.sendImageMessage(name, to, text);
  }
}

export default new WhatsAppSessionManager();
