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

class App {
  private app: express.Application;
  private httpServer!: http.Server;
  private httpsServer!: https.Server;
  private httpWebSocketServer: WebSocket.Server;
  private httpsWebSocketServer: WebSocket.Server;
  private database: Database;

  constructor() {
    this.app = express();
    this.database = new Database();
    this.setupHttpServer();
    this.setupHttpsServer();
    this.httpWebSocketServer = new WebSocket.Server({ server: this.httpServer });
    this.httpsWebSocketServer = new WebSocket.Server({ server: this.httpsServer });
    new WebSocketServer(this.httpWebSocketServer);
    new WebSocketServer(this.httpsWebSocketServer);
    this.setupMiddlewares();
    this.setupRoutes();
  }

  /**
   * Método privado para configurar o servidor HTTPS em ambiente de produção.
   * Verifica se as variáveis de ambiente HTTPS_PRIVATE_KEY_PATH e HTTPS_CERTIFICATE_PATH
   * estão definidas e cria o servidor HTTPS com as chaves privadas e certificados fornecidos.
   * Caso ocorra algum erro na configuração, registra o erro no log e encerra a aplicação.
   */
  private setupHttpsServer(): void {
    const privateKeyPath = process.env.HTTPS_PRIVATE_KEY_PATH;
    const certificatePath = process.env.HTTPS_CERTIFICATE_PATH;

    if (!privateKeyPath || !certificatePath) {
      console.error("The environment variables HTTPS_PRIVATE_KEY_PATH and HTTPS_CERTIFICATE_PATH must be defined in production environment.");
      process.exit(1);
    }

    const httpsOptions = {
      key: fs.readFileSync(privateKeyPath),
      cert: fs.readFileSync(certificatePath),
    };

    try {
      this.httpsServer = https.createServer(httpsOptions, this.app);
      logger.info(`[AppServer]: HTTPS Server configured on port ${process.env.HTTPS_PORT}`);
    } catch (error: any) {
      console.error(`[AppServer]: Error configuring HTTPS server: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Método privado para configurar o servidor HTTP em ambiente de desenvolvimento.
   * Cria o servidor HTTP padrão.
   */
  private setupHttpServer(): void {
    this.httpServer = http.createServer(this.app);
    logger.info(`[AppServer]: HTTP Server configured on port ${process.env.HTTP_PORT}`);
  }

  /**
   * Método privado para habilitar os middlewares da aplicação.
   * Habilita o middleware 'cors' para permitir solicitações de origens diferentes
   * e o middleware para analisar corpos de requisição JSON.
   */
  private setupMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  /**
   * Método privado para configurar as rotas da aplicação.
   * Utiliza as rotas definidas no arquivo routes.ts
   */
  private setupRoutes(): void {
    this.app.use(routes);
  }

  /**
   * Método público para iniciar o servidor.
   * Conecta ao banco de dados e inicia o servidor HTTP/HTTPS na porta especificada.
   * Aguarda a inicialização do servidor e restaura as sessões do WhatsApp.
   * Caso ocorra algum erro na inicialização, registra o erro no log e encerra a aplicação.
   * @param port O número da porta em que o servidor será iniciado.
   */
  public async start(): Promise<void> {
    try {
      await this.database.connect(); // Connect to the database

      // Start HTTP server on port process.env.HTTP_PORT
      this.httpServer.listen(process.env.HTTP_PORT, async () => {
        logger.info(`[AppServer]: HTTP Server started on port ${process.env.HTTP_PORT}`);
        logger.info("[AppServer]: WebSocket Server for HTTP started");
        await WhatsAppSessionManager.restoreSessions();
      });

      // Start HTTPS server on port process.env.HTTPS_PORT
      this.httpsServer.listen(process.env.HTTPS_PORT, async () => {
        logger.info(`[AppServer]: HTTPS Server started on port ${process.env.HTTPS_PORT}`);
        logger.info("[AppServer]: WebSocket Server for HTTPS started");
      });
    } catch (error: any) {
      logger.error(`[AppServer]: Failed to start the servers: ${error.message}`);
      process.exit(1); // Exit the application with an error code (1)
    }
  }
}

export default App;
