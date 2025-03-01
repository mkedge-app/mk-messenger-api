import mongoose, { Document, Schema } from 'mongoose';

interface UserFields {
  name: string;
  contactPhone: string;
  contactEmail: string;
  username: string;
  passwordHash: string;
  userType: 'admin' | 'tenant';
  status: 'active' | 'suspended' | 'trial';
  suspendedAt?: Date | null; // Armazena a data de suspensão, se o usuário estiver suspenso
  lastSessionDate?: Date | null; // Data da última vez que o usuário iniciou sessão

  updateLastSessionDate: () => Promise<void>;
}

interface UserDocument extends UserFields, Document { }

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    userType: { type: String, enum: ['admin', 'tenant'], required: true },
    status: { type: String, enum: ['active', 'suspended', 'trial'], default: 'active' },
    suspendedAt: { type: Date, default: null },
    lastSessionDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Função para atualizar a data da última sessão
userSchema.methods.updateLastSessionDate = function () {
  this.lastSessionDate = new Date(); // Atualiza a data para o momento atual
  return this.save(); // Salva a alteração no banco de dados
};

// Criando o modelo com o schema
const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
