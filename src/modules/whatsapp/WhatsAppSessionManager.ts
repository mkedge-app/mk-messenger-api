import WhatsAppSocketManager from './WhatsAppSocketManager';
import { Boom } from '@hapi/boom';
import logger from '../../logger';
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
      logger.info(`A sessão ${name} já está ativa.`);
      return;
    }

    await this.socketManager.createSocketWhatsApp(name);
    this.listenToConnectionUpdates(name);
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
        // Adiciona a sessão ao array de sessões como ativa
        this.sessions.push(session);

        // Notifica que a conexão foi estabelecida com sucesso
        this.connectionEstablishedSubject.next(session);
      }
      // Verifica se há um QR Code disponível na atualização
      else if ('qr' in update && update.qr) {
        // Emite o QR Code para os assinantes interessados
        this.qrCodeSubject.next({ name, qrcode: update.qr });
      }
    });
  }

  public async restoreSessions(): Promise<void> {
    const sessionNames = await this.socketManager.getExistingSessionNames();

    for (const name of sessionNames) {
      await this.initializeSession(name);
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
}

export default new WhatsAppSessionManager();
