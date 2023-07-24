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

  async searchPreapprovalsByPlanName(planName: string) {
    const apiUrl = `https://api.mercadopago.com/preapproval/search?q=${planName}`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    try {
      const response = await axios.get(apiUrl, { headers });
      console.log('Response:', response.data);
      // Aqui você pode tratar os dados da resposta conforme necessário
      return response;
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

export default new MercadoPagoService();
