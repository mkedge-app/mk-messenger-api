import express, { Express } from 'express';
import cors from 'cors';
import http from 'http';
import WebSocket from 'ws';
import routes from './routes';
import WebSocketServer from './websocket/WebSocketServer';

import './database';

class App {
  public app: Express;
  public server: http.Server;
  public wss: WebSocket.Server;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });

    this.middlewares();
    this.routes();
    this.setupWebSocket();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use(routes);
  }

  private setupWebSocket(): void {
    new WebSocketServer(this.wss);
  }
}

export default new App().server;
