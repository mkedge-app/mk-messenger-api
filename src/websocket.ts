import { Server as SocketServer, Socket } from 'socket.io';
import logger from './logger';
import WhatsAppSessionManager from './services/WhatsAppSessionManager';

class WebSocket {
  private connections: Socket[];

  constructor(private io: SocketServer) {
    this.connections = [];
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info('Nova conexão:', socket.id);

      this.connections.push(socket);

      this.handleAuthentication(socket)
        .then(() => {
          WhatsAppSessionManager.createSession(socket);
        })
        .catch((error) => {
          logger.error('Falha na autenticação do socket:', error);
          socket.disconnect(true);
        });

      socket.on('disconnect', () => {
        logger.info('Cliente desconectado:', socket.id);

        const index = this.connections.indexOf(socket);
        if (index > -1) {
          this.connections.splice(index, 1);
        }
      });
    });
  }

  private handleAuthentication(socket: Socket): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const token = socket.handshake.auth.token;

      // Verificar se o token é válido ou corresponde a um usuário autenticado
      if (token !== 'seu_token_de_autenticacao') {
        reject(new Error('Falha na autenticação do socket.'));
      } else {
        resolve();
      }
    });
  }
}

export default WebSocket;
