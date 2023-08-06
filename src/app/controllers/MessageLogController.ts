import { Request, Response } from "express";
import logger from "../../logger";
import MessageLogService from "../../services/MessageLogService";

class MessageLogController {
  async index(req: Request, res: Response) {
    try {
      // Obter todas as mensagens do log do banco de dados usando o MessageLogService
      const messages = await MessageLogService.getAllMessages();

      // Verificar se há mensagens encontradas
      if (messages.length === 0) {
        return res.status(404).json({ message: "Nenhuma mensagem encontrada no log" });
      }

      // Retornar as mensagens como resposta em formato JSON
      return res.json(messages);
    } catch (error) {
      logger.info("[MessageLogController]: Erro ao listar as mensagens do log:", error);
      return res.status(500).json({ error: "Erro ao listar as mensagens do log" });
    }
  }

  async show(req: Request, res: Response) {
    try {
      const { requester } = req.params;

      // Obter todas as mensagens do log associadas ao requester (remoteJid) usando o MessageLogService
      const messages = await MessageLogService.getMessagesByRequester(requester);

      // Verificar se há mensagens encontradas
      if (messages.length === 0) {
        return res.status(404).json({ message: "Nenhuma mensagem encontrada para o requester especificado" });
      }

      // Retornar as mensagens do requester como resposta em formato JSON
      return res.json(messages);
    } catch (error) {
      logger.info("[MessageLogController]: Erro ao obter mensagens do requester:", error);
      return res.status(500).json({ error: "Erro ao obter mensagens do requester" });
    }
  }
}

export default new MessageLogController();
