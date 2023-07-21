import mongoose, { Document, Schema } from 'mongoose';

// Definindo o esquema da mensagem
export interface IMessage extends Document {
  remoteJid: string; // Número de telefone ou ID do grupo do destinatário
  messageId: string; // ID único da mensagem
  content: string; // Conteúdo da mensagem
  status: number; // Status de envio da mensagem (conforme o enum Status que você mencionou)
  requester: string; // Solicitante do envio da mensagem
}

const messageSchema: Schema<IMessage> = new Schema(
  {
    remoteJid: { type: String, required: true },
    messageId: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: Number, required: true },
    requester: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Criando o modelo da mensagem
const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
