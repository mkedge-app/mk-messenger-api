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

/**
 * Classe AppServer.
 *
 * Esta classe representa o servidor de aplicação que utiliza o framework Express.js para lidar
 * com requisições HTTP/HTTPS e WebSocket. O servidor é responsável por configurar e iniciar o
 * servidor HTTP ou HTTPS com base nas variáveis de ambiente, bem como configurar middlewares
 * e rotas para a aplicação.
 */
class AppServer {
  private app: express.Application;
  private server!: http.Server | https.Server;
  private wss: WebSocket.Server;
  private database: Database;

  /**
   * Construtor da classe `AppServer`.
   * Inicializa a aplicação, o WebSocket, a conexão com o banco de dados e configura o servidor HTTP/HTTPS
   * com base no ambiente.
   */
  constructor() {
    this.app = express();
    this.database = new Database(); // Initialize the Database class

    this.setupServer();

    this.wss = new WebSocket.Server({ server: this.server });

    new WebSocketServer(this.wss); // Initialize WebSocketServer without storing it in a variable

    this.setupMiddlewares();
    this.setupRoutes();
  }

  /**
   * Método privado para configurar o servidor HTTP/HTTPS com base nas variáveis de ambiente.
   * Se estiver em ambiente de produção, configura o servidor HTTPS com as chaves privadas e certificados fornecidos.
   * Caso contrário, configura o servidor HTTP padrão.
   */
  private setupServer(): void {
    if (process.env.NODE_ENV === "production") {
      this.setupHttpsServer();
    } else {
      this.setupHttpServer();
    }
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
      console.error("As variáveis de ambiente HTTPS_PRIVATE_KEY_PATH e HTTPS_CERTIFICATE_PATH devem ser definidas em ambiente de produção.");
      process.exit(1);
    }

    const httpsOptions = {
      key: fs.readFileSync(privateKeyPath),
      cert: fs.readFileSync(certificatePath),
    };

    try {
      this.server = https.createServer(httpsOptions, this.app);
      logger.info("[AppServer]: Servidor HTTPS configurado");
    } catch (error: any) {
      console.error(`[AppServer]: Erro ao configurar o servidor HTTPS: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Método privado para configurar o servidor HTTP em ambiente de desenvolvimento.
   * Cria o servidor HTTP padrão.
   */
  private setupHttpServer(): void {
    this.server = http.createServer(this.app);
    logger.info("[AppServer]: Servidor HTTP configurado");
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
