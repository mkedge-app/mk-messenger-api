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

  async delete(req: Request, res: Response) {
    const name = req.params.name;
    const session = WhatsAppSessionManager.getSessionByName(name);

    if (session) {
      // Chame o método para excluir a sessão aqui
      WhatsAppSessionManager.deleteSession(name);

      return res.json({ message: 'Sessão excluída com sucesso' });
    } else {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }
  }
}

export default new WhatsAppSessionController();
