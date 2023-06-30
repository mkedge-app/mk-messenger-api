import WebSocket from 'ws';
import { QRCodeData } from '../../types/WhatsAppApi';
import { Session } from '../whatsapp/WhatsAppSessionManager';

interface SocketMap {
  [name: string]: WebSocket;
}

class WebSocketDataSender {
  private activeConnections: SocketMap;

  constructor(activeConnections: SocketMap) {
    this.activeConnections = activeConnections;
  }

  public sendDataToClient(data: QRCodeData | Session): void {
    const { name } = data;

    const ws = this.activeConnections[name];
    if (ws) {
      let message = '';

      if ('qrcode' in data) {
        // Dados do QRCode
        const qrCodeResponse = {
          success: true,
          message: 'QR code gerado com sucesso',
          data: {
            qrCode: data.qrcode,
          },
        };
        message = JSON.stringify(qrCodeResponse);
      } else if ('active' in data) {
        // Dados de conexão estabelecida
        const connectionResponse = {
          success: true,
          message: 'Sessão iniciada com sucesso',
          data: {
            session: data,
          },
        };
        message = JSON.stringify(connectionResponse);
      }

      ws.send(message);
    }
  }

  public sendSuccessMessage(ws: WebSocket, message: string): void {
    const successResponse = {
      success: true,
      message: message,
    };
    ws.send(JSON.stringify(successResponse));
  }

  public sendErrorMessage(ws: WebSocket, errorMessage: string): void {
    const errorResponse = {
      success: false,
      error: errorMessage,
    };
    ws.send(JSON.stringify(errorResponse));
  }
}

export default WebSocketDataSender;
