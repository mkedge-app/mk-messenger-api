import makeWASocket, { ConnectionState, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import logger from '../../logger';
import { Boom } from '@hapi/boom';
import { Subject } from 'rxjs';

type WASocket = ReturnType<typeof makeWASocket>;
type VoidResponse = void;
type QrCodeSubjectResponse = { qrcode: string };

class WhatsAppSocket {
  private socket!: WASocket;
  private connectionUpdateSubject = new Subject<Partial<ConnectionState>>();
  private qrCodeSubject = new Subject<QrCodeSubjectResponse>();
  private connectionOpenedSubject = new Subject<VoidResponse>();
  private connectionLoggedOutSubject = new Subject<VoidResponse>();
  private connectionRestartRequiredSubject = new Subject<VoidResponse>();
  private connectionBadSessionSubject = new Subject<VoidResponse>();
  private connectionClosedSubject = new Subject<VoidResponse>();
  private connectionReplacedSubject = new Subject<VoidResponse>();
  private multideviceMismatchSubject = new Subject<VoidResponse>();
  private timedOutSubject = new Subject<VoidResponse>();

  constructor(private readonly name: string) {

  }

  public async create(): Promise<void> {
    logger.info(`[WhatsAppSocket] Criando WASocket para ${this.name}...`);
    await this.initializeSocket();
    this.listenForConnectionUpdates();
  }

  private async initializeSocket(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(`tokens/${this.name}`);
    this.socket = makeWASocket({ printQRInTerminal: true, auth: state });
    this.socket.ev.on('creds.update', () => {
      saveCreds();
    });
  }

  private listenForConnectionUpdates(): void {
    logger.info(`[WhatsAppSocket] Ouvindo atualizações de conexão para o WASocket de ${this.name}`);
    this.socket.ev.on('connection.update', (update: Partial<ConnectionState>) => {
      this.handleConnectionUpdate(update);
    });
  }

  private handleConnectionUpdate(update: Partial<ConnectionState>): void {
    logger.info(`[WhatsAppSocket] Atualização de conexão do socket de ${this.name} recebida...`);
    const { connection, lastDisconnect } = update;
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

    if (connection === 'close') {
      logger.info(`[WhatsAppSocket] A conexão com o socket de ${this.name} foi fechada`);
      this.socket = undefined;
      if (statusCode) {
        this.handleConnectionClosed(statusCode);
      }
    } else if (connection === 'open') {
      logger.info(`[WhatsAppSocket] A conexão com o socket de ${this.name} está aberta`);
      this.connectionUpdateSubject.next(update);
    } else if ('qr' in update && update.qr) {
      this.emitQrCode(update.qr);
    }

    this.connectionUpdateSubject.next(update);
  }

  private handleConnectionClosed(statusCode: number): void {
    const subjects: { [key: number]: Subject<void> } = {
      [DisconnectReason.loggedOut]: this.connectionLoggedOutSubject,
      [DisconnectReason.restartRequired]: this.connectionRestartRequiredSubject,
      [DisconnectReason.badSession]: this.connectionBadSessionSubject,
      [DisconnectReason.connectionClosed]: this.connectionClosedSubject,
      // [DisconnectReason.connectionLost]: this.connectionLostSubject,
      [DisconnectReason.connectionReplaced]: this.connectionReplacedSubject,
      [DisconnectReason.multideviceMismatch]: this.multideviceMismatchSubject,
      [DisconnectReason.timedOut]: this.timedOutSubject,
    };

    const subject = subjects[statusCode];
    if (subject) {
      logger.info(`[WhatsAppSocket] Motivo: ${DisconnectReason[statusCode]}`);
      subject.next();
    }
  }

  private emitQrCode(qrCode: string): void {
    this.qrCodeSubject.next({ qrcode: qrCode });
  }

  // Métodos para obter os subjects

  public getConnectionUpdateSubject(): Subject<Partial<ConnectionState>> {
    return this.connectionUpdateSubject;
  }

  public getQrCodeSubject(): Subject<QrCodeSubjectResponse> {
    return this.qrCodeSubject;
  }

  public getConnectionOpenedSubject(): Subject<VoidResponse> {
    return this.connectionOpenedSubject;
  }

  public getConnectionLoggedOutSubject(): Subject<VoidResponse> {
    return this.connectionLoggedOutSubject;
  }

  public getConnectionRestartRequiredSubject(): Subject<VoidResponse> {
    return this.connectionRestartRequiredSubject;
  }

  public getConnectionBadSessionSubject(): Subject<VoidResponse> {
    return this.connectionBadSessionSubject;
  }

  public getConnectionClosedSubject(): Subject<VoidResponse> {
    return this.connectionClosedSubject;
  }

  public getConnectionReplacedSubject(): Subject<VoidResponse> {
    return this.connectionReplacedSubject;
  }

  public getMultideviceMismatchSubject(): Subject<VoidResponse> {
    return this.multideviceMismatchSubject;
  }

  public getTimedOutSubject(): Subject<VoidResponse> {
    return this.timedOutSubject;
  }
}

export default WhatsAppSocket;
