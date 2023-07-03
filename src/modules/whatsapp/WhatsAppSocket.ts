import makeWASocket, { ConnectionState, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import path from 'path';
import FileUtils from '../../services/FileUtils';

export type WASocket = ReturnType<typeof makeWASocket>;
type VoidResponse = void;
export type QrCodeSubjectResponse = { qrcode: string };

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

  private readonly tokensFolder = path.resolve(__dirname, '..', '..', '..', 'tokens');

  constructor(private readonly name: string) { }

  public async create(): Promise<void> {
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
    this.socket.ev.on('connection.update', (update: Partial<ConnectionState>) => {
      this.handleConnectionUpdate(update);
    });
  }

  private handleConnectionUpdate(update: Partial<ConnectionState>): void {
    if ('qr' in update && update.qr) {
      this.qrCodeSubject.next({ qrcode: update.qr });
    }

    this.connectionUpdateSubject.next(update);
  }

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
