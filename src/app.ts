import express, { Express } from 'express';
import cors from 'cors';
import http, { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import routes from './routes';
import WebSocket from './websocket';

import './database';

class App {
  public app: Express;
  public server: Server;
  public io: SocketServer;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketServer(this.server);

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
    new WebSocket(this.io);
  }
}

export default new App().server;
