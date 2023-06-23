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
      // Middleware de autenticação
      this.authMiddleware.handleConnection(req, (authenticated: boolean) => {
        if (authenticated) {
          // Lidar com a conexão autenticada
          this.handleAuthenticatedConnection(ws);
        } else {
          // Lidar com a conexão não autorizada
          this.handleUnauthorizedConnection(ws);
        }
      });
    });
  }

  private handleAuthenticatedConnection(ws: WebSocket): void {
    // Adicionar a conexão ativa à lista de conexões
    this.activeConnections.push(ws);
    // Enviar mensagem de sucesso para o cliente
    this.sendSuccessMessage(ws, 'Conexão estabelecida com sucesso!');

    // Criar uma sessão de gerenciamento do WhatsApp para a conexão
    WhatsAppSessionManager.createSession(ws);

    ws.on('close', () => {
      console.log('Cliente desconectado');
      // Remover a conexão fechada da lista de conexões
      this.removeConnection(ws);
      // Lógica para manipular o fechamento da conexão
    });
  }

  private handleUnauthorizedConnection(ws: WebSocket): void {
    // Enviar mensagem de erro para o cliente
    ws.send('Token não fornecido ou inválido');
    // Fechar a conexão
    ws.close();
  }

  private sendSuccessMessage(ws: WebSocket, message: string): void {
    // Enviar mensagem de sucesso para o cliente
    ws.send(message);
  }

  private removeConnection(ws: WebSocket): void {
    // Remover a conexão da lista de conexões ativas
    const index = this.activeConnections.indexOf(ws);
    if (index > -1) {
      this.activeConnections.splice(index, 1);
    }
  }
}

export default WebSocketServer;
