import { Request, Response } from "express";
import logger from "../../logger";
import MessageLogService, { PaginationResult } from "../../services/MessageLogService";
import { IMessage } from "../models/Message";

class MessageLogController {
  async index(req: Request, res: Response) {
    try {
      // Extrai os parâmetros de consulta da solicitação, como "page" (página atual) e "limit" (limite de itens por página).
      const { page = 1, limit = 10 } = req.query;

      // Chama um serviço chamado MessageLogService para obter todas as mensagens com paginação, com base nos parâmetros da consulta.
      const paginationResult: PaginationResult<IMessage> = await MessageLogService.getAllMessagesWithPagination(
        +page, // Converte "page" para um número
        +limit // Converte "limit" para um número
      );

      // Verifica se não há mensagens encontradas no log.
      if (paginationResult.data.length === 0) {
        return res.status(404).json({ message: "Nenhuma mensagem encontrada no log" });
      }

      // Retorna uma resposta JSON contendo informações de paginação e as mensagens encontradas.
      return res.json({
        currentPage: paginationResult.currentPage,
        totalPages: paginationResult.totalPages,
        totalMessages: paginationResult.totalMessages,
        messages: paginationResult.data,
      });
    } catch (error) {
      // Em caso de erro, registra o erro no log e retorna uma resposta de erro com status 500.
      logger.info("[MessageLogController]: Erro ao listar as mensagens do log:", error);
      return res.status(500).json({ error: "Erro ao listar as mensagens do log" });
    }
  }


  async show(req: Request, res: Response) {
    try {
      const { requester } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const paginationResult: PaginationResult<IMessage> = await MessageLogService.getMessagesByRequesterWithPagination(
        requester,
        +page,
        +limit
      );

      if (paginationResult.data.length === 0) {
        return res.status(404).json({ message: "Nenhuma mensagem encontrada para o requester especificado" });
      }

      return res.json({
        currentPage: paginationResult.currentPage,
        totalPages: paginationResult.totalPages,
        totalMessages: paginationResult.totalMessages,
        messages: paginationResult.data,
      });
    } catch (error) {
      logger.info("[MessageLogController]: Erro ao obter mensagens do requester:", error);
      return res.status(500).json({ error: "Erro ao obter mensagens do requester" });
    }
  }
}

export default new MessageLogController();
