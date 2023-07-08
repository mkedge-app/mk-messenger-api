import { Request, Response } from "express";
import WhatsAppSessionManager from "../../modules/whatsapp/WhatsAppSessionManager";

class WhatsAppMessageController {
  async create(req: Request, res: Response) {
    // Verificar se todos os parâmetros necessários estão presentes
    const { name, to, text } = req.body;
    if (!name || !to || !text) {
      return res.status(400).json({ error: "Parâmetros incompletos" });
    }

    // Se todos os parâmetros estiverem corretos, execute a lógica de envio de mensagem
    try {
      await WhatsAppSessionManager.sendTextMessage(name, to, text);

      return res.json({ message: 'Mensagem enviada com sucesso'});
    } catch (error) {
      console.log("Erro ao enviar mensagem:", error);
      return res.status(500).json({ error: "Erro ao enviar mensagem" });
    }
  }
}

export default new WhatsAppMessageController();
