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
  private https!: https.Server;
  private httpWebSocketServer!: WebSocket.Server; // Declare without initializer
  private httpsWebSocketServer?: WebSocket.Server; // Declare without initializer
  private database: Database;

  constructor() {
    this.app = express();
    this.database = new Database();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupHttpServer();
    this.setupHttpsServer();
  }

  /**
   * Sets up the HTTP server and WebSocket server for HTTP.
   */
  private setupHttpServer(): void {
    this.httpServer = http.createServer(this.app);
    this.httpWebSocketServer = new WebSocket.Server({ server: this.httpServer }); // Create WebSocket server for HTTP
    new WebSocketServer(this.httpWebSocketServer);
    logger.info(`[AppServer]: HTTP Server configured on port ${process.env.HTTP_PORT}`);
  }

  /**
   * Sets up the HTTPS server and WebSocket server for HTTPS (production only).
   * The server requires environment variables HTTPS_PRIVATE_KEY_PATH and HTTPS_CERTIFICATE_PATH to be defined.
   * In non-production environments, HTTPS server setup is skipped.
   */
  private setupHttpsServer(): void {
    if (process.env.NODE_ENV === "production") {
      const privateKeyPath = process.env.HTTPS_PRIVATE_KEY_PATH;
      const certificatePath = process.env.HTTPS_CERTIFICATE_PATH;

      if (!privateKeyPath || !certificatePath) {
        console.error("The environment variables HTTPS_PRIVATE_KEY_PATH and HTTPS_CERTIFICATE_PATH must be defined in the production environment.");
        process.exit(1);
      }

      const httpsOptions = {
        key: fs.readFileSync(privateKeyPath),
        cert: fs.readFileSync(certificatePath),
      };

      try {
        this.https = https.createServer(httpsOptions, this.app);
        this.httpsWebSocketServer = new WebSocket.Server({ server: this.https }); // Create WebSocket server for HTTPS
        new WebSocketServer(this.httpsWebSocketServer);
        logger.info(`[AppServer]: HTTPS Server configured on port ${process.env.HTTPS_PORT}`);
      } catch (error: any) {
        console.error(`[AppServer]: Error configuring HTTPS server: ${error.message}`);
        process.exit(1);
      }
    } else {
      logger.info("[AppServer]: Skipping HTTPS server setup in non-production environment.");
    }
  }

  /**
   * Sets up the middlewares for the Express app.
   * Configures CORS and JSON body parser.
   */
  private setupMiddlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  /**
   * Sets up the routes for the Express app.
   * Uses the routes defined in the 'routes.ts' file.
   */
  private setupRoutes(): void {
    this.app.use(routes);
  }

  /**
   * Starts the HTTP and HTTPS servers, connects to the database, and restores WhatsApp sessions.
   * The HTTP server listens on the port specified in the environment variable HTTP_PORT.
   * The HTTPS server (production only) listens on the port specified in the environment variable HTTPS_PORT.
   */
  public async start(): Promise<void> {
    // Check if HTTP_PORT and HTTPS_PORT are defined
    if (!process.env.HTTP_PORT || !process.env.HTTPS_PORT) {
      console.error("[AppServer]: Environment variables HTTP_PORT and HTTPS_PORT must be defined.");
      process.exit(1);
    }
  
    try {
      await this.database.connect();
      this.httpServer.listen(process.env.HTTP_PORT, async () => {
        logger.info(`[AppServer]: HTTP Server started on port ${process.env.HTTP_PORT}`);
        logger.info("[AppServer]: WebSocket Server for HTTP started");
        await WhatsAppSessionManager.restoreSessions();
      });
  
      if (process.env.NODE_ENV === "production" && this.httpsWebSocketServer) {
        this.https.listen(process.env.HTTPS_PORT, async () => {
          logger.info(`[AppServer]: HTTPS Server started on port ${process.env.HTTPS_PORT}`);
          logger.info("[AppServer]: WebSocket Server for HTTPS started");
        });
      }
    } catch (error: any) {
      logger.error(`[AppServer]: Failed to start the servers: ${error.message}`);
      process.exit(1);
    }
  }
}

export default App;
