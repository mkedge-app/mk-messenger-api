import Message, { IMessage } from "../app/models/Message";

export interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  data: T[];
}

class MessageLogService {
  async createMessageLog(remoteJid: string, messageId: string, content: string, status: number, requester: string) {
    try {
      // Criar e salvar o log da mensagem no banco de dados
      const newMessageLog = await Message.create({
        remoteJid,
        messageId,
        content,
        status,
        requester,
      });

      return newMessageLog;
    } catch (error) {
      throw new Error("Erro ao criar registro do log da mensagem");
    }
  }

  async updateMessageStatus(key: { remoteJid: string; id: string }, update: { status: number }): Promise<IMessage | null> {
    try {
      // Procurar a mensagem no banco de dados com base no remoteJid e id fornecidos
      const message = await Message.findOne({ messageId: key.id });

      if (message) {
        // Atualizar o status da mensagem
        message.status = update.status;
        // Salvar a mensagem atualizada no banco de dados
        await message.save();
        return message;
      } else {
        // Se a mensagem não for encontrada, retornar null ou lançar uma exceção
        // dependendo da lógica que faz mais sentido para a sua aplicação.
        return null;
      }
    } catch (error) {
      throw new Error("Erro ao atualizar status da mensagem");
    }
  }

  async getMessagesByRequester(requester: string): Promise<IMessage[]> {
    try {
      const messages = await Message.find({ remoteJid: requester });
      return messages;
    } catch (error) {
      throw new Error("Erro ao obter mensagens do requester");
    }
  }

  async getAllMessages(): Promise<IMessage[]> {
    try {
      const messages = await Message.find({});
      return messages;
    } catch (error) {
      throw new Error("Erro ao obter todas as mensagens do log");
    }
  }

  async getAllMessagesWithPagination(page: number, limit: number): Promise<PaginationResult<IMessage>> {
    try {
      const skip = (page - 1) * limit;

      const totalMessages = await Message.countDocuments();
      const totalPages = Math.ceil(totalMessages / limit);

      const messages = await Message.find()
        .sort({ createdAt: -1 }) // Ordenar do mais recente para o mais antigo
        .skip(skip)
        .limit(limit);

      return {
        currentPage: page,
        totalPages,
        totalMessages,
        data: messages,
      };
    } catch (error: any) {
      throw new Error("Error fetching messages with pagination: " + error.message);
    }
  }
}

export default new MessageLogService();
