import makeWASocket, { ConnectionState, DisconnectReason, WAProto, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import fs from 'fs-extra';
import path from 'path';
import logger from '../../logger';
import { Boom } from '@hapi/boom';
import FileUtils from '../../services/FileUtils';

type WASocket = ReturnType<typeof makeWASocket> | undefined;

interface ConnectionUpdateData {
  name: string;
  update: Partial<ConnectionState>;
}

class WhatsAppSocketManager {
  private sockets: Map<string, WASocket> = new Map();
  private connectionUpdateSubjects: Map<string, Subject<Partial<ConnectionState>>> = new Map();
  private fileUtils: FileUtils;
  private readonly tokensFolder: string;
  private readonly loggerPrefix: string = '[WhatsAppSocketManager]';

  constructor() {
    this.fileUtils = new FileUtils();
    this.tokensFolder = path.resolve(__dirname, '..', '..', '..', 'tokens');
  }

  /**
   * Cria uma nova sessão do WhatsApp.
   * @param name O nome da sessão.
   * @returns Uma Promise que é resolvida quando a sessão é criada.
   */
  public createSocketWhatsApp(name: string): Promise<void> {
    return new Promise<void>(async (resolve) => {
      logger.info(`${this.loggerPrefix} Criando sessão para ${name}...`);
      const { state, saveCreds } = await useMultiFileAuthState(`tokens/${name}`);

      const socketWhatsApp = makeWASocket({ printQRInTerminal: true, auth: state, qrTimeout: 20000 });

      socketWhatsApp.ev.on('creds.update', () => {
        saveCreds();
      });

      logger.info(`${this.loggerPrefix} Ouvindo atualizações de conexão para o WASocket de ${name}`);
      socketWhatsApp.ev.on('connection.update', (update: Partial<ConnectionState>) => {
        this.handleConnectionUpdate({ name, update });
      });

      this.sockets.set(name, socketWhatsApp);

      resolve();
    });
  }

  /**
   * Manipula a atualização de conexão do socket do WhatsApp.
   * @param data Os dados de atualização de conexão.
   * @returns Uma Promise que é resolvida quando a atualização é manipulada.
   */
  private async handleConnectionUpdate(data: ConnectionUpdateData): Promise<void> {
    const { name, update } = data;
    logger.info(`${this.loggerPrefix} Atualização de conexão do socket de ${name} recebida...`);

    const { connection, lastDisconnect } = update;
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

    if (connection === 'close') {
      logger.info(`${this.loggerPrefix} A conexão com o socket de ${name} foi fechada`);
      this.sockets.delete(name);
      await this.handleConnectionClosed(name, statusCode);
    }

    // Emitir a atualização da conexão para o Observable correspondente
    const subject = this.connectionUpdateSubjects.get(name);
    if (subject) { subject.next(update) }
  }

  /**
   * Lida com o fechamento da conexão do socket do WhatsApp e executa a lógica correspondente com base no código de status.
   * @param name O nome da conexão do socket do WhatsApp.
   * @param statusCode O código de status que indica o motivo do fechamento da conexão.
   * @returns Uma Promise que é resolvida quando a lógica de tratamento é concluída.
   */
  private async handleConnectionClosed(name: string, statusCode?: number): Promise<void> {
    switch (statusCode) {
      case DisconnectReason.loggedOut:
        logger.info(`${this.loggerPrefix} Motivo: Logout`);
        this.handleLoggedOut(name);
        break;
      case DisconnectReason.restartRequired:
        logger.info(`${this.loggerPrefix} Motivo: Reinicialização necessária`);
        await this.createSocketWhatsApp(name); // Reconectar...
        break;
      case DisconnectReason.badSession:
        logger.info(`${this.loggerPrefix} Motivo: badSession`);
        break;
      case DisconnectReason.connectionClosed:
        logger.info(`${this.loggerPrefix} Motivo: Conexão fechada`);
        await this.createSocketWhatsApp(name); // Reconectar...
        break;
      case DisconnectReason.connectionLost:
        logger.info(`${this.loggerPrefix} Motivo: Conexão perdida`);
        break;
      case DisconnectReason.connectionReplaced:
        logger.info(`${this.loggerPrefix} Motivo: connectionReplaced`);
        break;
      case DisconnectReason.multideviceMismatch:
        logger.info(`${this.loggerPrefix} Motivo: multideviceMismatch`);
        break;
      case DisconnectReason.timedOut:
        logger.info(`${this.loggerPrefix} Motivo: timedOut`);
        break;
      default:
        break;
    }
  }

  /**
   * Manipula a ação de logout de uma sessão do WhatsApp.
   * @param name O nome da sessão.
   */
  private handleLoggedOut(name: string): void {
    const tokensFolderPath = path.resolve(this.tokensFolder, name);
    this.fileUtils.deleteFolderRecursive(tokensFolderPath);
  }

  /**
   * Obtém o Observable de atualização de conexão para um nome de sessão específico.
   * @param name O nome da sessão.
   * @returns O Observable de atualização de conexão.
   */
  public getConnectionUpdateObservable(name: string): Subject<Partial<ConnectionState>> {
    let subject = this.connectionUpdateSubjects.get(name);
    if (!subject) {
      subject = new Subject<Partial<ConnectionState>>();
      this.connectionUpdateSubjects.set(name, subject);
    }
    return subject;
  }

  /**
   * Retorna os nomes das sessões existentes.
   * @returns Uma Promise que é resolvida com um array de nomes de sessão.
   */
  public async getExistingSessionNames(): Promise<string[]> {
    logger.info('[WhatsAppSocketManager]: Buscando sessões existentes...');
    const folderNames = await fs.readdir(this.tokensFolder);
    const nonEmptyFolderNames: string[] = [];

    for (const folderName of folderNames) {
      const folderPath = path.join(this.tokensFolder, folderName);
      const folderContent = await fs.readdir(folderPath);

      if (folderContent.length > 0) {
        nonEmptyFolderNames.push(folderName);
      } else {
        await fs.remove(folderPath);
      }
    }

    return nonEmptyFolderNames;
  }

  /**
   * Obtém o socket do WhatsApp com base no nome da sessão.
   * @param name O nome da sessão.
   * @returns O socket do WhatsApp correspondente ou undefined se não for encontrado.
   */
  public getSocketByName(name: string): WASocket {
    return this.sockets.get(name);
  }

  /**
   * Manipula a desconexão de um cliente do WebSocket.
   * @param name O nome do cliente.
   */
  public handleWebSocketClientDisconnection(name: string): void {
    const WASocket = this.getSocketByName(name);

    if (WASocket) {
      if (!WASocket.user) {
        // A sessão foi abandonada durante a inicialização
        WASocket.logout();

        // Cancelar a assinatura do Observable de atualização de conexão
        const subject = this.connectionUpdateSubjects.get(name);
        subject?.unsubscribe();

        // Remover o Observable do mapa de Observables de atualização de conexão
        this.connectionUpdateSubjects.delete(name);
      }
    }
  }

  public logoutSessionByName(name: string): void {
    const WASocket = this.getSocketByName(name);

    if (WASocket) {
      WASocket.logout();

      // Cancelar a assinatura do Observable de atualização de conexão
      const subject = this.connectionUpdateSubjects.get(name);
      subject?.unsubscribe();

      // Remover o Observable do mapa de Observables de atualização de conexão
      this.connectionUpdateSubjects.delete(name);
    }
  }

  public deactivateSession(name: string) {
    const WASocket = this.getSocketByName(name);
    if (WASocket) { WASocket.ws.close() }
  }

  public async sendTextMessage(name: string, to: string, text: string): Promise<WAProto.WebMessageInfo | undefined> {
    const WASocket = this.getSocketByName(name);

    if (WASocket) {
      const id = `${to}@s.whatsapp.net`
      const sentMsg = await WASocket.sendMessage(id, { text });
      return sentMsg;
    } else {
      return undefined;
    }
  }
}

export default WhatsAppSocketManager;
