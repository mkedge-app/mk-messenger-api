import makeWASocket, { ConnectionState, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
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
  private connectionUpdateSubjects: { [name: string]: Subject<Partial<ConnectionState>> } = {};
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

      const socketWhatsApp = makeWASocket({ printQRInTerminal: true, auth: state });

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
    } else if (connection === 'open') {
      logger.info(`${this.loggerPrefix} A conexão com o socket de ${name} está aberta`);
      // Lógica para lidar com a conexão estabelecida
    }

    // Emitir a atualização da conexão para o Observable correspondente
    if (this.connectionUpdateSubjects[name]) {
      this.connectionUpdateSubjects[name].next(update);
    }
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
   * Obtém o Observable de atualização de conexão para um nome de sessão específico.
   * @param name O nome da sessão.
   * @returns O Observable de atualização de conexão.
   */
  public getConnectionUpdateObservable(name: string): Subject<Partial<ConnectionState>> {
    if (!this.connectionUpdateSubjects[name]) {
      this.connectionUpdateSubjects[name] = new Subject<Partial<ConnectionState>>();
    }
    return this.connectionUpdateSubjects[name];
  }

  /**
   * Manipula a ação de logout de uma sessão do WhatsApp.
   * @param name O nome da sessão.
   */
  private handleLoggedOut(name: string): void {
    const tokensFolderPath = this.resolveTokensFolderPath(name);
    this.fileUtils.deleteFolderRecursive(tokensFolderPath);
  }

  /**
   * Resolve o caminho da pasta de tokens para uma sessão específica.
   * @param name O nome da sessão.
   * @returns O caminho completo da pasta de tokens.
   */
  private resolveTokensFolderPath(name: string): string {
    const tokensFolderPath = path.resolve(this.tokensFolder, name);
    return tokensFolderPath;
  }

  /**
   * Retorna os nomes das sessões existentes.
   * @returns Uma Promise que é resolvida com um array de nomes de sessão.
   */
  public async getExistingSessionNames(): Promise<string[]> {
    const folderNames = await fs.readdir(this.tokensFolder);
    const nonEmptyFolderNames: string[] = [];

    for (const folderName of folderNames) {
      const folderPath = path.join(this.tokensFolder, folderName);
      const folderContent = await fs.readdir(folderPath);

      if (folderContent.length > 0) {
        nonEmptyFolderNames.push(folderName);
      }
    }

    return nonEmptyFolderNames;
  }

}

export default WhatsAppSocketManager;
