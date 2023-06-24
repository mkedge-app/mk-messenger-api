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
      this.authMiddleware.handleConnection(req, (authenticated: boolean, tenantId?: string) => {
        if (authenticated) {
          // Lidar com a conexão autenticada
          this.handleAuthenticatedConnection(ws, tenantId);
        } else {
          // Lidar com a conexão não autorizada
          this.handleUnauthorizedConnection(ws);
        }
      });
    });
  }

  private async handleAuthenticatedConnection(ws: WebSocket, tenantId?: string): Promise<void> {
    // Adicionar a conexão ativa à lista de conexões
    this.activeConnections.push(ws);
    // Enviar mensagem de sucesso para o cliente
    this.sendSuccessMessage(ws, 'Conexão estabelecida com sucesso!');

    try {
      // Criar uma sessão de gerenciamento do WhatsApp para a conexão, passando o tenantId, se disponível
      await WhatsAppSessionManager.createSession(ws, tenantId);
    } catch (error: any) {
      this.sendErrorMessage(ws, error.message);
      ws.close();
    }

    ws.on('close', () => {
      console.log('Cliente desconectado');
      // Remover a conexão fechada da lista de conexões
      this.removeConnection(ws);
      // Lógica para manipular o fechamento da conexão
    });
  }

  private handleUnauthorizedConnection(ws: WebSocket): void {
    // Enviar mensagem de erro para o cliente
    this.sendErrorMessage(ws, 'Token não fornecido ou inválido');
    // Fechar a conexão
    ws.close();
  }

  private sendSuccessMessage(ws: WebSocket, successMessage: string): void {
    const successResponse = {
      success: true,
      message: successMessage,
    };
    ws.send(JSON.stringify(successResponse));
  }

  private removeConnection(ws: WebSocket): void {
    // Remover a conexão da lista de conexões ativas
    const index = this.activeConnections.indexOf(ws);
    if (index > -1) {
      this.activeConnections.splice(index, 1);
    }
  }

  private sendErrorMessage(ws: WebSocket, errorMessage: string): void {
    const errorResponse = {
      success: false,
      error: errorMessage,
    };
    ws.send(JSON.stringify(errorResponse));
  }
}

export default WebSocketServer;
