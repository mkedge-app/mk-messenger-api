import express, { Express } from 'express';
import cors from 'cors';
import http, { Server } from 'http';
import routes from './routes';

class App {
  public app: Express;
  public server: Server;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);

    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private routes(): void {
    this.app.use(routes);
  }
}

export default new App().server;
