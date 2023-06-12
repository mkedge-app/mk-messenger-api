// Importando as dependências
import mongoose, { Document, Schema } from 'mongoose';
import { Tenant as ITenant } from '../../types/Tenant';

// Definindo o esquema do usuário
const tenantSchema: Schema<ITenant & Document> = new Schema({
  cnpj: { type: String, required: true, unique: true },
  responsavel: { type: String, required: true },
  contato: { type: String, required: true, unique: true },
  provedor: {
    nome: { type: String },
  },
  database: {
    name: { type: String },
    dialect: { type: String },
    host: { type: String },
    username: { type: String },
    password: { type: String },
  },
  assinatura: {
    valor: { type: Number },
    data_vencimento: { type: Date },
    dia_vencimento: { type: String },
    ativa: { type: Boolean },
  },
  usuario: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Atualizar a propriedade updatedAt sempre que um documento for atualizado
tenantSchema.pre<ITenant & Document>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Criando o modelo do usuário
const Tenant = mongoose.model<ITenant & Document>('Tenant', tenantSchema);

export default Tenant;
