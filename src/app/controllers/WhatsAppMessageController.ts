import { Request, Response } from "express";
import WhatsAppSessionManager from "../../modules/whatsapp/WhatsAppSessionManager";
import MessageLogService from "../../services/MessageLogService";
import { AuthenticatedRequest } from "../../types/authentication";

class WhatsAppMessageController {
  async create(req: Request, res: Response) {
    try {
      // Extrair os parâmetros necessários do corpo da requisição
      const { name, to, text, type } = req.body;

      // Verificar se todos os parâmetros necessários estão presentes
      if (!name || !to || text == null || !type) {
        return res.status(400).json({ error: "Parâmetros incompletos" });
      }

      // Garantir que text seja sempre uma string usando o operador de coalescência nula (??)
      const cleanedText = typeof text === 'string' ? text.replace(/[\r\n]/g, '') : '';

      let sentMessage;

      switch (type) {
        case 'text':
          // Enviar a mensagem usando o WhatsAppSessionManager
          sentMessage = await WhatsAppSessionManager.sendTextMessage(name, to, text);
          break;

        case 'file':
          // Enviar a mensagem usando o WhatsAppSessionManager
          sentMessage = await WhatsAppSessionManager.sendFileMessage(name, to, text);
          break;

        case 'image':
          // Enviar a mensagem usando o WhatsAppSessionManager
          sentMessage = await WhatsAppSessionManager.sendImageMessage(name, to, text);
          break;

        default:
          break;
      }

      // Verificar se a mensagem foi enviada com sucesso
      if (sentMessage && sentMessage.key && typeof sentMessage.key.id === 'string') {
        const request = req as AuthenticatedRequest;

        // Certificar-se de que request.userId é uma string usando o operador de coalescência nula (??)
        const requester = request.userId ?? "";

        // Criar e salvar o log da mensagem no banco de dados usando o serviço MessageLogService
        const newMessageLog = await MessageLogService.createMessageLog(
          to,
          sentMessage.key.id,
          cleanedText,
          sentMessage.status,
          requester
        );

        return res.json({ message: "Mensagem enviada com sucesso", data: newMessageLog });
      } else {
        return res.status(500).json({ error: "Erro ao enviar mensagem" });
      }
    } catch (error) {
      // Tratar qualquer erro ocorrido durante o envio da mensagem
      return res.status(500).json({ error: "Erro ao enviar mensagem" });
    }
  }
}

export default new WhatsAppMessageController();
