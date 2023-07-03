import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Subject } from 'rxjs';
import AuthMiddleware from './middlewares/AuthMiddleware';
import WhatsAppSessionManager, { Session } from '../whatsapp/WhatsAppSessionManager';
import logger from '../../logger';
import { QRCodeData } from '../../types/WhatsAppApi';
import WebSocketDataSender from './WebSocketDataSender';

interface SocketMap {
  [name: string]: WebSocket;
}

class WebSocketServer {
  private wss: WebSocket.Server;
  private activeConnections: SocketMap = {};
  private authMiddleware: AuthMiddleware;
  private qrCodeSubject: Subject<QRCodeData>;
  private connectionEstablishedSubject: Subject<Session>;
  private webSocketDataSender: WebSocketDataSender;

  constructor(server: WebSocket.Server) {
    // Armazena a instância do servidor WebSocket
    this.wss = server;

    // Inicializa o middleware de autenticação
    this.authMiddleware = new AuthMiddleware();

    // Obtém o Subject para receber notificações do código QR
    this.qrCodeSubject = WhatsAppSessionManager.getQrCodeObservable();

    // Obtém o Subject para receber notificações de conexão estabelecida
    this.connectionEstablishedSubject = WhatsAppSessionManager.getConnectionEstablishedObservable();

    // Inicializa o objeto responsável por enviar dados via WebSocket para as conexões ativas
    this.webSocketDataSender = new WebSocketDataSender(this.activeConnections);

    // Configura o servidor WebSocket
    this.setupWebSocket();

    // Inscreve-se no Subject do código QR para receber notificações
    this.subscribeToQrCodeSubject();

    // Inscreve-se no Subject de conexão estabelecida para receber notificações
    this.subscribeToConnectionEstablishedSubject();

    // Registra uma mensagem informativa de que o WebSocketServer foi inicializado
    logger.info('WebSocketServer inicializado');
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage): void => {
      logger.info(`Pedido para inicializar sessão recebido`);
      // Middleware de autenticação
      this.authMiddleware.handleConnection(req, (authenticated: boolean, tenantId?: string) => {
        if (authenticated) {
          if (tenantId) {
            // Lidar com a conexão autenticada
            this.handleAuthenticatedConnection(ws, tenantId);
          } else {
            this.handleMissingTenantId(ws);
          }
        } else {
          // Lidar com a conexão não autorizada
          this.handleUnauthorizedConnection(ws);
        }
      });
    });
  }

  private handleAuthenticatedConnection(ws: WebSocket, tenantId: string): void {
    // Adicionar a conexão ativa ao objeto de conexões usando o tenantId como chave
    this.activeConnections[tenantId] = ws;

    // Enviar mensagem de sucesso para o cliente
    this.webSocketDataSender.sendSuccessMessage(ws, 'Conexão estabelecida com sucesso!');

    // Informar o WhatsAppSessionManager sobre a nova conexão em busca de QR code
    WhatsAppSessionManager.initializeSession(tenantId);

    ws.on('close', () => {
      console.log('Cliente desconectado');
      // Remover a conexão fechada do objeto de conexões
      if (tenantId) {
        delete this.activeConnections[tenantId];
      }
      // Lógica para manipular o fechamento da conexão
    });
  }

  private handleMissingTenantId(ws: WebSocket): void {
    // Enviar mensagem de erro para o cliente
    this.webSocketDataSender.sendErrorMessage(ws, 'ID do tenant não fornecido');
    // Fechar a conexão
    ws.close();
  }

  private handleUnauthorizedConnection(ws: WebSocket): void {
    // Enviar mensagem de erro para o cliente
    this.webSocketDataSender.sendErrorMessage(ws, 'Token não fornecido ou inválido');
    // Fechar a conexão
    ws.close();
  }

  private subscribeToQrCodeSubject(): void {
    this.qrCodeSubject.subscribe((data: QRCodeData) => {
      // Enviar o QR code para o cliente (WebSocket)
      this.webSocketDataSender.sendDataToClient(data);
    });
  }

  private subscribeToConnectionEstablishedSubject(): void {
    this.connectionEstablishedSubject.subscribe((data: Session) => {
      // Enviar dados para o cliente (WebSocket)
      this.webSocketDataSender.sendDataToClient(data);
      const ws = this.activeConnections[data.name];
      if (ws) { ws.close() }
    });
  }
}

export default WebSocketServer;
