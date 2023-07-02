import { Request, Response } from "express";
import WhatsAppSessionManager from "../../modules/whatsapp/WhatsAppSessionManager";

class WhatsAppSessionController {
  async index(req: Request, res: Response) {
    const sessions = WhatsAppSessionManager.getSessions();
    return res.json(sessions);
  }

  async show(req: Request, res: Response) {
    const name = req.params.name;
    const session = WhatsAppSessionManager.getSessionByName(name);

    if (session) {
      return res.json(session);
    } else {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }
  }
}

export default new WhatsAppSessionController();
