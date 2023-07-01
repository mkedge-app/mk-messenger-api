import { Request, Response } from "express";
import WhatsAppSessionManager from "../../modules/whatsapp/WhatsAppSessionManager";

class WhatsAppSessionController {
  async index(req: Request, res: Response) {
    const sessions = WhatsAppSessionManager.getSessions();
    return res.json(sessions);
  }
}

export default new WhatsAppSessionController();
