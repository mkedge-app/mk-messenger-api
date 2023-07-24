import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import WebSocket from "ws";
import cors from 'cors';
import routes from "./routes";
import logger from './logger';
import WebSocketServer from "./modules/websocket/WebSocketServer";
import WhatsAppSessionManager from "./modules/whatsapp/WhatsAppSessionManager";
import Database from "./database";

class AppServer {
  private app: express.Application;
  private server!: http.Server | https.Server;
  private wss: WebSocket.Server;
  private database: Database;

  constructor() {
    this.app = express();
    this.database = new Database();

    this.setupServer();

    this.wss = new WebSocket.Server({ server: this.server });

    new WebSocketServer(this.wss);

    this.setupMiddlewares();
    this.setupRoutes();
  }

  private setupServer(): void {
    if (process.env.NODE_ENV === "development") {
      const privateKeyPath = process.env.HTTPS_PRIVATE_KEY_PATH;
      const certificatePath = process.env.HTTPS_CERTIFICATE_PATH;

      if (!privateKeyPath || !certificatePath) {
        logger.error("As variáveis de ambiente HTTPS_PRIVATE_KEY_PATH e HTTPS_CERTIFICATE_PATH devem ser definidas em ambiente de produção.");
        process.exit(1);
      }

      const httpsOptions = {
        key: fs.readFileSync(privateKeyPath),
        cert: fs.readFileSync(certificatePath),
      };

      this.server = https.createServer(httpsOptions, this.app);
      logger.info("[AppServer]: Servidor HTTPS configurado");
    } else {
      this.server = http.createServer(this.app);
      logger.info("[AppServer]: Servidor HTTP configurado");
    }
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

  public async start(port: number): Promise<void> {
    try {
      await this.database.connect(); // Conectar ao banco de dados
      this.server.listen(port, async () => {
        logger.info(`[AppServer]: Servidor ${process.env.NODE_ENV === "production" ? "HTTPS" : "HTTP"} iniciado`);
        logger.info(`[AppServer]: Servidor WebSocket iniciado`);
        await WhatsAppSessionManager.restoreSessions();
      });
    } catch (error: any) {
      logger.error(`[AppServer]: Falha ao iniciar o servidor: ${error.message}`);
      process.exit(1); // Encerra a aplicação com código de erro (1)
    }
  }
}

export default AppServer;
