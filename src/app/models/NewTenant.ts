import mongoose from "mongoose";

const newTenantSchema = new mongoose.Schema({
  // Tipo do inquilino (exemplo: 'Empresa', 'Pessoa Física')
  tenant_type: {
    type: String,
    required: true,
    enum: ['Empresa', 'Pessoa Física']
  },

  // Nome do inquilino (obrigatório)
  name: {
    type: String,
    required: true
  },

  // Email de contato do inquilino (obrigatório e válido)
  contact_email: {
    type: String,
    required: true,
    validate: {
      validator: function (email: string) {
        // Use uma expressão regular para validar o formato do email
        return /\S+@\S+\.\S+/.test(email);
      },
      message: '{VALUE} não é um email válido.'
    }
  },

  // Telefone de contato do inquilino (obrigatório)
  contact_phone: {
    type: String,
    required: true
  },

  // Nome de usuário do inquilino (obrigatório)
  username: {
    type: String,
    required: true
  },

  // Hash da senha do inquilino (obrigatório)
  password_hash: {
    type: String,
    required: true
  },

  // Assinatura associada ao inquilino (referência a uma Subscription)
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  }
}, {
  timestamps: true // Adiciona campos createdAt e updatedAt automaticamente
});

const NewTenant = mongoose.model('NewTenant', newTenantSchema);

export default NewTenant;
