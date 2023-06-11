// Definindo a interface do usuário
export interface Tenant {
  cnpj: string;
  responsavel: string;
  contato: string;
  provedor: string;
  database: {
    name: string;
    dialect: string;
    host: string;
    username: string;
    password: string;
  };
  assinatura: {
    valor: number;
    data_vencimento: Date;
    dia_vencimento: string;
    ativa: boolean;
  };
  usuario: string;
  senha: string;
  createdAt?: Date;
  updatedAt?: Date;
}
