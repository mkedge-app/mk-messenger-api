import WebSocket from 'ws';
import { QRCodeData } from '../../types/WhatsAppApi';

interface SocketMap {
  [name: string]: WebSocket;
}

class QRCodeSubscriber {
  private activeConnections: SocketMap;

  constructor(activeConnections: SocketMap) {
    this.activeConnections = activeConnections;
  }

  public sendQrCodeToClient(data: QRCodeData): void {
    const { name, qrcode } = data;
    const ws = this.activeConnections[name];

    if (ws) {
      const qrCodeResponse = {
        success: true,
        message: 'QR code gerado com sucesso',
        data: {
          qrCode: qrcode,
        },
      };

      ws.send(JSON.stringify(qrCodeResponse));
    }
  }
}

export default QRCodeSubscriber;
