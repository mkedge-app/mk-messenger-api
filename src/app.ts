import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import WebSocket from "ws";
import cors from 'cors';
import routes from "./routes"; // Importe as rotas do arquivo routes.ts
import logger from './logger';
import WebSocketServer from "./modules/websocket/WebSocketServer"; // Importe a classe WebSocketServer
import WhatsAppSessionManager from "./modules/whatsapp/WhatsAppSessionManager";
import Database from "./database";

class AppServer {
  private app: express.Application;
  private server: http.Server | https.Server;
  private wss: WebSocket.Server;
  private database: Database; // Adicione este atributo

  constructor() {
    this.app = express();
    this.database = new Database(); // Inicialize a instância da classe Database

    // Verifica se está em ambiente de produção para escolher entre HTTP e HTTPS
    if (process.env.NODE_ENV === "production") {
      const privateKeyPath = process.env.HTTPS_PRIVATE_KEY_PATH;
      const certificatePath = process.env.HTTPS_CERTIFICATE_PATH;

      try {
        if (!privateKeyPath || !certificatePath) {
          throw new Error("As variáveis de ambiente HTTPS_PRIVATE_KEY_PATH e HTTPS_CERTIFICATE_PATH devem ser definidas em ambiente de produção.");
        }

        const httpsOptions = {
          key: fs.readFileSync(privateKeyPath),
          cert: fs.readFileSync(certificatePath),
        };

        this.server = https.createServer(httpsOptions, this.app);
      } catch (error: any) {
        logger.error(`[AppServer]: Erro ao configurar HTTPS: ${error.message}`);
        process.exit(1);
      }
    } else {
      this.server = http.createServer(this.app);
    }

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

  public async start(port: number): Promise<void> {
    try {
      await this.database.connect(); // Conectar ao banco de dados
      this.server.listen(port, async () => {
        logger.info(`[AppServer]: Servidor ${process.env.NODE_ENV === "production" ? "HTTPS" : "HTTP"} iniciado em http://localhost:${port}`);
        await WhatsAppSessionManager.restoreSessions();
      });
    } catch (error: any) {
      logger.error(`[AppServer]: Falha ao iniciar o servidor: ${error.message}`);
      process.exit(1); // Encerra a aplicação com código de erro (1)
    }
  }
}

export default AppServer;
