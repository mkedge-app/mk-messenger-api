import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import AuthMiddleware from './middlewares/AuthMiddleware';
import WhatsAppSessionManager from '../services/WhatsAppSessionManager';

class WebSocketServer {
  private wss: WebSocket.Server;
  private activeConnections: WebSocket[] = [];
  private authMiddleware: AuthMiddleware;

  constructor(server: WebSocket.Server) {
    this.wss = server;
    this.authMiddleware = new AuthMiddleware();
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage): void => {
      this.authMiddleware.handleConnection(req, (authenticated: boolean) => {
        if (authenticated) {
          this.handleAuthenticatedConnection(ws);
        } else {
          this.handleUnauthorizedConnection(ws);
        }
      });
    });
  }

  private handleAuthenticatedConnection(ws: WebSocket): void {
    this.activeConnections.push(ws);
    this.sendSuccessMessage(ws, 'Conexão estabelecida com sucesso!');

    WhatsAppSessionManager.createSession(ws);

    ws.on('close', () => {
      console.log('Cliente desconectado');
      this.removeConnection(ws);
      // Lógica para manipular o fechamento da conexão
    });
  }

  private handleUnauthorizedConnection(ws: WebSocket): void {
    ws.send('Token não fornecido ou inválido');
    ws.close();
  }

  private sendSuccessMessage(ws: WebSocket, message: string): void {
    ws.send(message);
  }

  private handleMessage(ws: WebSocket, message: WebSocket.Data): void {
    ws.send(message.toString());
  }

  private removeConnection(ws: WebSocket): void {
    const index = this.activeConnections.indexOf(ws);
    if (index > -1) {
      this.activeConnections.splice(index, 1);
    }
  }
}

export default WebSocketServer;
