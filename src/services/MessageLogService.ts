import Message from "../app/models/Message";

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
}

export default new MessageLogService();
