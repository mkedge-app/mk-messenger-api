import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Subject } from 'rxjs';
import AuthMiddleware from './middlewares/AuthMiddleware';
import WhatsAppSessionManager from '../services/WhatsAppSessionManager';
import logger from '../logger';

class WebSocketServer {
  private wss: WebSocket.Server;
  private activeConnections: WebSocket[] = [];
  private authMiddleware: AuthMiddleware;
  private qrCodeSubject: Subject<string>;

  constructor(server: WebSocket.Server) {
    this.wss = server;
    this.authMiddleware = new AuthMiddleware();
    this.qrCodeSubject = WhatsAppSessionManager.getQrCodeObservable();
    this.setupWebSocket();
    this.subscribeToQrCodeSubject();
    logger.info('WebSocketServer inicializado');
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage): void => {
      logger.info(`Pedido para inicializar sessão recebido`);
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

  private handleAuthenticatedConnection(ws: WebSocket, tenantId?: string): void {
    // Adicionar a conexão ativa à lista de conexões
    this.activeConnections.push(ws);
    // Enviar mensagem de sucesso para o cliente
    this.sendSuccessMessage(ws, 'Conexão estabelecida com sucesso!');

    if (tenantId) {
      // Informar o WhatsAppSessionManager sobre a nova conexão em busca de QR code
      WhatsAppSessionManager.createSession(tenantId);
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

  private subscribeToQrCodeSubject(): void {
    this.qrCodeSubject.subscribe((qrCode: string) => {
      logger.info(qrCode)
      // Enviar o QR code para o cliente (WebSocket)
      this.sendQrCodeToClients(qrCode);
    });
  }

  private sendQrCodeToClients(qrCode: string): void {
    const qrCodeResponse = {
      success: true,
      message: 'QR code gerado com sucesso',
      data: {
        qrCode: qrCode,
      }
    };

    // Enviar o QR code para todos os clientes conectados
    this.activeConnections.forEach((ws: WebSocket) => {

      ws.send(JSON.stringify(qrCodeResponse));
    });
  }
}

export default WebSocketServer;
