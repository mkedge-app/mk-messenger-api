import { Request, Response } from "express";
import logger from "../../logger";
import MessageLogService, { PaginationResult } from "../../services/MessageLogService";
import { IMessage } from "../models/Message";

class MessageLogController {
  async index(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const paginationResult: PaginationResult<IMessage> = await MessageLogService.getAllMessagesWithPagination(
        +page,
        +limit
      );

      if (paginationResult.data.length === 0) {
        return res.status(404).json({ message: "Nenhuma mensagem encontrada no log" });
      }

      return res.json({
        currentPage: paginationResult.currentPage,
        totalPages: paginationResult.totalPages,
        totalMessages: paginationResult.totalMessages,
        messages: paginationResult.data,
      });
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
