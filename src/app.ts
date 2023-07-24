import express from "express";
import http from "http";
import WebSocket from "ws";
import cors from 'cors';
import routes from "./routes"; // Importe as rotas do arquivo routes.ts
import logger from './logger';
import WebSocketServer from "./modules/websocket/WebSocketServer"; // Importe a classe WebSocketServer
import WhatsAppSessionManager from "./modules/whatsapp/WhatsAppSessionManager";

class AppServer {
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocket.Server;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });

    new WebSocketServer(this.wss); // Initialize WebSocketServer without storing it in a variable

    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupMiddlewares(): void {
    // Habilitar o middleware 'cors' para permitir solicitações de origens diferentes
    this.app.use(cors());

    // Habilitar o middleware para analisar corpos de requisição JSON
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    // Use as rotas definidas no arquivo routes.ts
    this.app.use(routes);
  }

  public start(port: number): void {
    this.server.listen(port, async () => {
      logger.info(`[AppServer]: Servidor HTTP iniciado em http://localhost:${port}`);
      await WhatsAppSessionManager.restoreSessions();
    });
  }
}

export default AppServer;
