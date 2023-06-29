import makeWASocket, { ConnectionState, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Subject } from 'rxjs';
import fs from 'fs-extra';
import path from 'path';
import logger from '../../logger';
import { Boom } from '@hapi/boom';
import FileUtils from '../../services/FileUtils';

interface ConnectionUpdateData {
  name: string;
  update: Partial<ConnectionState>;
}

class WhatsAppSocketManager {
  private sockets: { [name: string]: any } = {};
  private connectionUpdateSubjects: { [name: string]: Subject<Partial<ConnectionState>> } = {};
  private fileUtils: FileUtils;

  constructor() {
    this.fileUtils = new FileUtils();
  }

  public createSocketWhatsApp(name: string): Promise<void> {
    return new Promise<void>(async (resolve) => {
      logger.info(`Criando sessão para ${name}...`);
      const { state, saveCreds } = await useMultiFileAuthState(`tokens/${name}`);

      const socketWhatsApp = makeWASocket({ printQRInTerminal: true, auth: state });

      socketWhatsApp.ev.on('creds.update', () => {
        saveCreds();
      });

      logger.info(`Ouvindo o evento 'connection.update' para o WASocket de ${name}`);
      socketWhatsApp.ev.on('connection.update', (update: Partial<ConnectionState>) => {
        this.handleConnectionUpdate({ name, update });
      });

      this.sockets[name] = socketWhatsApp;

      resolve();
    });
  }

  private async handleConnectionUpdate(data: ConnectionUpdateData): Promise<void> {
    const { name, update } = data;
    logger.info(`Atualização de conexão do socket de ${name} recebida`);

    const { connection, lastDisconnect } = update;
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

    if (connection === 'close') {
      delete this.sockets[name];

      if (statusCode === DisconnectReason.loggedOut) {
        this.handleLoggedOut(name);
        logger.info('Conexão fechada devido a logout');
      } else if (!Object.values(DisconnectReason).includes(statusCode)) {
        await this.createSocketWhatsApp(name); // Reconectar...
      }

    } else if (connection === 'open') {
      logger.info('Conexão estabelecida');
      // Lógica para lidar com a conexão estabelecida
    }

    // Emitir a atualização da conexão para o Observable correspondente
    if (this.connectionUpdateSubjects[name]) {
      this.connectionUpdateSubjects[name].next(update);
    }
  }

  public getConnectionUpdateObservable(name: string): Subject<Partial<ConnectionState>> {
    if (!this.connectionUpdateSubjects[name]) {
      this.connectionUpdateSubjects[name] = new Subject<Partial<ConnectionState>>();
    }
    return this.connectionUpdateSubjects[name];
  }

  private handleLoggedOut(name: string): void {
    const tokensFolderPath = this.resolveTokensFolderPath(name);
    this.fileUtils.deleteFolderRecursive(tokensFolderPath);
  }

  private resolveTokensFolderPath(name: string): string {
    const tokensFolderPath = path.resolve(__dirname, '..', '..', '..', 'tokens', name);
    return tokensFolderPath;
  }

  public async restoreSessions(): Promise<void> {
    logger.info('Restaurando sessões existentes...');
    const tokensFolder = path.resolve(__dirname, '..', '..', 'tokens');
    const folderNames = await fs.readdir(tokensFolder);

    for (const folderName of folderNames) {
      const name = folderName;
      const sessionFolderPath = path.join(tokensFolder, name);
      const sessionFolderContent = await fs.readdir(sessionFolderPath);

      if (sessionFolderContent.length > 0) {
        logger.info(`Iniciando sessão de ${name}...`);
        await this.createSocketWhatsApp(name); // Reconectar...
      } else {
        logger.info(`O diretório da sessão ${name} está vazio. A sessão não será iniciada.`);
      }
    }
    logger.info('Restaurando sessões finalizou');
  }
}

export default WhatsAppSocketManager;
