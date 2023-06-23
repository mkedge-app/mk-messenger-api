import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import AuthUtils from './services/AuthUtils';
import { VerifyErrors } from 'jsonwebtoken';

class WebSocketServer {
  private wss: WebSocket.Server;
  private activeConnections: WebSocket[] = [];

  constructor(server: WebSocket.Server) {
    this.wss = server;
    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage): void => {
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      this.handleTokenError(ws, 'Token não fornecido');
      return;
    }

    try {
      const decodedToken = AuthUtils.verifyToken(token);

      if (!this.isValidToken(decodedToken)) {
        this.handleTokenError(ws, 'O token não contém as informações necessárias');
        return;
      }

      this.activeConnections.push(ws);
      this.sendSuccessMessage(ws, 'Conexão estabelecida com sucesso!');

      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });
    } catch (error) {
      this.handleTokenVerificationError(ws, error as VerifyErrors);
    }

    ws.on('close', () => {
      console.log('Cliente desconectado');
      this.removeConnection(ws);
      // Lógica para manipular o fechamento da conexão
    });
  }

  private isValidToken(decodedToken: any): boolean {
    return decodedToken.hasOwnProperty('tenantId') && decodedToken.hasOwnProperty('isTenantActive');
  }

  private handleTokenError(ws: WebSocket, errorMessage: string): void {
    ws.send(errorMessage);
    ws.close();
  }

  private handleTokenVerificationError(ws: WebSocket, error: Error): void {
    const jwtError = error as VerifyErrors;

    const errorMessages: Record<string, string> = {
      JsonWebTokenError: 'Token inválido',
      NotBeforeError: 'Token ainda não é válido',
      TokenExpiredError: 'Token expirado',
      SignatureVerificationError: 'Erro na verificação da assinatura do token'
    };

    const errorName = jwtError.name;
    const errorMessage = errorMessages[errorName];

    if (errorMessage) {
      ws.send(errorMessage);
    } else {
      ws.send('Erro ao processar o token');
    }

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
