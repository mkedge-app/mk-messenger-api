import makeWASocket, { ConnectionState, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import logger from '../../logger';
import { Boom } from '@hapi/boom';
import { Subject } from 'rxjs';

type WASocket = ReturnType<typeof makeWASocket> | undefined;
type VoidResponse = void;

interface QrCodeSubjectResponse {
  qrcode: string
}

class WhatsAppSocket {
  private socket: WASocket;
  private connectionUpdateSubject: Subject<Partial<ConnectionState>>;
  private qrCodeSubject: Subject<QrCodeSubjectResponse>;
  private connectionOpenedSubject: Subject<VoidResponse>;
  private connectionLoggedOutSubject: Subject<VoidResponse>;
  private connectionRestartRequiredSubject: Subject<VoidResponse>;
  private connectionBadSessionSubject: Subject<VoidResponse>;
  private connectionClosedSubject: Subject<VoidResponse>;
  private connectionLostSubject: Subject<VoidResponse>;
  private connectionReplacedSubject: Subject<VoidResponse>;
  private multideviceMismatchSubject: Subject<VoidResponse>;
  private timedOutSubject: Subject<VoidResponse>;


  constructor(private readonly name: string) {
    this.connectionUpdateSubject = new Subject<Partial<ConnectionState>>();
    this.qrCodeSubject = new Subject<QrCodeSubjectResponse>();
    this.connectionOpenedSubject = new Subject<VoidResponse>();
    this.connectionLoggedOutSubject = new Subject<VoidResponse>();
    this.connectionRestartRequiredSubject = new Subject<VoidResponse>();
    this.connectionBadSessionSubject = new Subject<VoidResponse>();
    this.connectionClosedSubject = new Subject<VoidResponse>();
    this.connectionLostSubject = new Subject<VoidResponse>();
    this.connectionReplacedSubject = new Subject<VoidResponse>();
    this.multideviceMismatchSubject = new Subject<VoidResponse>();
    this.timedOutSubject = new Subject<VoidResponse>();
  }

  public async create(): Promise<void> {
    logger.info(`[WhatsAppSocket] Criando sessão para ${this.name}...`);
    const { state, saveCreds } = await useMultiFileAuthState(`tokens/${this.name}`);

    this.socket = makeWASocket({ printQRInTerminal: true, auth: state });

    this.socket.ev.on('creds.update', () => {
      saveCreds();
    });

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
      this.handleConnectionClosed(statusCode);
    } else if (connection === 'open') {
      logger.info(`[WhatsAppSocket] A conexão com o socket de ${this.name} está aberta`);
      this.connectionOpenedSubject.next();
    } else if ('qr' in update && update.qr) {
      // Emite o QR Code para os assinantes interessados
      this.qrCodeSubject.next({ qrcode: update.qr });
    }

    this.connectionUpdateSubject.next(update);
  }

  private handleConnectionClosed(statusCode?: number): void {
    switch (statusCode) {
      case DisconnectReason.loggedOut:
        logger.info(`[WhatsAppSocket] Motivo: Logout`);
        this.connectionLoggedOutSubject.next();
        break;
      case DisconnectReason.restartRequired:
        logger.info(`[WhatsAppSocket] Motivo: Reinicialização necessária`);
        this.connectionRestartRequiredSubject.next();
        break;
      case DisconnectReason.badSession:
        logger.info(`[WhatsAppSocket] Motivo: badSession`);
        this.connectionBadSessionSubject.next();
        break;
      case DisconnectReason.connectionClosed:
        logger.info(`[WhatsAppSocket] Motivo: Conexão fechada`);
        this.connectionClosedSubject.next();
        break;
      case DisconnectReason.connectionLost:
        logger.info(`[WhatsAppSocket] Motivo: Conexão perdida`);
        this.connectionLostSubject.next();
        break;
      case DisconnectReason.connectionReplaced:
        logger.info(`[WhatsAppSocket] Motivo: connectionReplaced`);
        this.connectionReplacedSubject.next();
        break;
      case DisconnectReason.multideviceMismatch:
        logger.info(`[WhatsAppSocket] Motivo: multideviceMismatch`);
        this.multideviceMismatchSubject.next();
        break;
      case DisconnectReason.timedOut:
        logger.info(`[WhatsAppSocket] Motivo: timedOut`);
        this.timedOutSubject.next();
        break;
      default:
        break;
    }
  }

  public getConnectionUpdateObservable(): Subject<Partial<ConnectionState>> {
    return this.connectionUpdateSubject;
  }
}

export default WhatsAppSocket;
