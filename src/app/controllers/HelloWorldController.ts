import { Request, Response } from 'express';

class HelloWorldController {
  async index(req: Request, res: Response) {
    return res.json({ ok: true });
  }
}

export default new HelloWorldController();
