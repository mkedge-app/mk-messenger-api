import makeWASocket, { ConnectionState, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import logger from '../../logger';
import { Boom } from '@hapi/boom';
import { Subject } from 'rxjs';

type WASocket = ReturnType<typeof makeWASocket> | undefined;

class WhatsAppSocket {
  private socket: WASocket;
  private connectionUpdateSubject: Subject<Partial<ConnectionState>>;

  constructor(private readonly name: string) {
    this.connectionUpdateSubject = new Subject<Partial<ConnectionState>>();
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
      // Lógica para lidar com a conexão estabelecida
    }

    this.connectionUpdateSubject.next(update);
  }

  private handleConnectionClosed(statusCode?: number): void {
    switch (statusCode) {
      case DisconnectReason.loggedOut:
        logger.info(`[WhatsAppSocket] Motivo: Logout`);
        // Lógica para lidar com o logout
        break;
      case DisconnectReason.restartRequired:
        logger.info(`[WhatsAppSocket] Motivo: Reinicialização necessária`);
        // Lógica para lidar com a reinicialização necessária
        break;
      case DisconnectReason.badSession:
        logger.info(`[WhatsAppSocket] Motivo: badSession`);
        // Lógica para lidar com uma sessão inválida
        break;
      case DisconnectReason.connectionClosed:
        logger.info(`[WhatsAppSocket] Motivo: Conexão fechada`);
        // Lógica para lidar com uma conexão fechada
        break;
      case DisconnectReason.connectionLost:
        logger.info(`[WhatsAppSocket] Motivo: Conexão perdida`);
        // Lógica para lidar com uma conexão perdida
        break;
      case DisconnectReason.connectionReplaced:
        logger.info(`[WhatsAppSocket] Motivo: connectionReplaced`);
        // Lógica para lidar com uma conexão substituída
        break;
      case DisconnectReason.multideviceMismatch:
        logger.info(`[WhatsAppSocket] Motivo: multideviceMismatch`);
        // Lógica para lidar com um conflito de dispositivos múltiplos
        break;
      case DisconnectReason.timedOut:
        logger.info(`[WhatsAppSocket] Motivo: timedOut`);
        // Lógica para lidar com o tempo limite
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
