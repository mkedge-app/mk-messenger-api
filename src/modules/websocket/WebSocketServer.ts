import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { Subject } from 'rxjs';
import AuthMiddleware from './middlewares/AuthMiddleware';
import WhatsAppSessionManager, { Session } from '../whatsapp/WhatsAppSessionManager';
import logger from '../../logger';
import { QRCodeData } from '../../types/WhatsAppApi';
import WebSocketDataSender from './WebSocketDataSender';
import User from '../../app/models/User';

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
  }

  // Configura o servidor WebSocket e define o callback para quando novas conexões são estabelecidas
  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage): void => {
      logger.info(`Pedido para inicializar sessão recebido`);

      // Define um callback para quando uma mensagem é recebida da conexão WebSocket
      ws.on('message', async (message: string) => {
        const { token } = JSON.parse(message);

        // Middleware de autenticação
        await this.authMiddleware.handleConnection(token, async (authenticated: boolean, userId?: string) => {
          if (authenticated) {
            if (userId) {
              // Verificando o status do usuário após a autenticação
              const user = await User.findById(userId);
              if (user && user.status === 'suspended') {
                this.webSocketDataSender.sendErrorMessage(ws, 'Usuário suspenso. Não é possível iniciar a sessão.');
                ws.close();
                return;
              }

              // Lidar com a conexão autenticada
              this.handleAuthenticatedConnection(ws, userId);
            } else {
              this.handleMissingUserId(ws);
            }
          } else {
            // Lidar com a conexão não autorizada
            this.handleUnauthorizedConnection(ws);
          }
        });
      });
    });
  }

  // Trata uma conexão autenticada
  private async handleAuthenticatedConnection(ws: WebSocket, userId: string): Promise<void> {
    // Adicionar a conexão ativa ao objeto de conexões usando o userId como chave
    this.activeConnections[userId] = ws;

    // Enviar mensagem de sucesso para o cliente
    this.webSocketDataSender.sendSuccessMessage(ws, 'Conexão estabelecida com sucesso!');

    // Atualizar o campo lastSessionDate do usuário através do método criado
    try {
      const user = await User.findById(userId);
      if (user) {
        await user.updateLastSessionDate();
      }
    } catch (error) {
      logger.error(`Erro ao atualizar lastSessionDate: ${error}`);
    }

    // Informar o WhatsAppSessionManager sobre a nova conexão em busca de QR code
    try {
      await WhatsAppSessionManager.initializeSession(userId);
    } catch (error: any) {
      this.webSocketDataSender.sendErrorMessage(ws, error.message);
      ws.close();
    }

    // Define um callback para quando a conexão é fechada pelo cliente
    ws.on('close', () => {
      // Remover a conexão fechada do objeto de conexões
      if (userId) {
        delete this.activeConnections[userId];
        WhatsAppSessionManager.handleWSClientDisconnection(userId);
      }
    });
  }

  // Trata uma conexão que não fornece o ID do user
  private handleMissingUserId(ws: WebSocket): void {
    // Enviar mensagem de erro para o cliente
    this.webSocketDataSender.sendErrorMessage(ws, 'ID do user não fornecido');
    // Fechar a conexão
    ws.close();
  }

  // Trata uma conexão não autorizada
  private handleUnauthorizedConnection(ws: WebSocket): void {
    // Enviar mensagem de erro para o cliente
    this.webSocketDataSender.sendErrorMessage(ws, 'Token não fornecido ou inválido');
    // Fechar a conexão
    ws.close();
  }

  // Inscreve-se no Subject do código QR para receber notificações
  private subscribeToQrCodeSubject(): void {
    this.qrCodeSubject.subscribe((data: QRCodeData) => {
      // Enviar o QR code para o cliente (WebSocket)
      this.webSocketDataSender.sendDataToClient(data);
    });
  }

  // Inscreve-se no Subject de conexão estabelecida para receber notificações
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
