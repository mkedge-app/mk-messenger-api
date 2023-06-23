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
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.send('Token não fornecido');
        ws.close();
      }

      if (token) {
        try {
          const decodedToken = AuthUtils.verifyToken(token);

          if (!decodedToken.hasOwnProperty('tenantId') || !decodedToken.hasOwnProperty('isTenantActive')) {
            ws.send('O token não contém as informações necessárias');
            ws.close();
          }

          this.activeConnections.push(ws);
          ws.send('Conexão estabelecida com sucesso!');

          ws.on('message', (message) => {
            ws.send(message.toString());
          });
        } catch (error) {
          // If there is an error verifying the token, handle the token error
          const jwtError = error as VerifyErrors;

          const errorMessages: Record<string, string> = {
            JsonWebTokenError: "Token inválido",
            NotBeforeError: "Token ainda não é válido",
            TokenExpiredError: "Token expirado",
            SignatureVerificationError: "Erro na verificação da assinatura do token"
          };

          const errorName = jwtError.name;
          const errorMessage = errorMessages[errorName];

          if (errorMessage) {
            ws.send(errorMessage);
            ws.close();
          } else {
            ws.send('Erro ao processar o token');
            ws.close();
          }

        }
      }

      ws.on('close', () => {
        console.log('Cliente desconectado');

        const index = this.activeConnections.indexOf(ws);
        if (index > -1) {
          this.activeConnections.splice(index, 1);
        }

        // Lógica para manipular o fechamento da conexão
      });
    });
  }
}

export default WebSocketServer;
