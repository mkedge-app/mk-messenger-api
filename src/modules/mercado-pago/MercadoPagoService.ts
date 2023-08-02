import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class MercadoPagoService {
  private accessToken: string | undefined;

  constructor() {
    this.accessToken = process.env.MP_ACCESS_TOKEN;

    if (!this.accessToken) {
      throw new Error("Access token do Mercado Pago não encontrado.");
    }
  }

  async consultarDadosDaAssinatura(idAssinatura: string) {
    const apiUrl = `https://api.mercadopago.com/preapproval/${idAssinatura}`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const response = await axios.get(apiUrl, { headers });
      console.log('Informações da assinatura:', response.data);
      // Aqui você pode tratar os dados da resposta conforme necessário
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar dados da assinatura:', error);
      throw error;
    }
  }

  async consultarDadosDaFatura(idFatura: string) {
    const apiUrl = `https://api.mercadopago.com/authorized_payments/${idFatura}`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const response = await axios.get(apiUrl, { headers });
      console.log('Informações da fatura:', response.data);
      // Aqui você pode tratar os dados da resposta conforme necessário
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar dados da fatura:', error);
      throw error;
    }
  }

  async consultarDadosDoPagamento(idPagamento: string) {
    const apiUrl = `https://api.mercadopago.com/v1/payments/${idPagamento}`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const response = await axios.get(apiUrl, { headers });
      console.log('Informações do pagamento:', response.data);
      // Aqui você pode tratar os dados da resposta conforme necessário
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar dados do pagamento:', error);
      throw error;
    }
  }
}

export default new MercadoPagoService();
