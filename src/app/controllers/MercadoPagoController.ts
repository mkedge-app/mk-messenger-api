import { Request, Response } from 'express';
import MercadoPagoService from '../../modules/mercado-pago/MercadoPagoService';

class MercadoPagoController {
  async show(req: Request, res: Response) {
    const planName = req.params.planName;

    try {
      const response = await MercadoPagoService.searchPreapprovalsByPlanName(planName);
      if (response) {
        return res.status(200).json({ data: response.data });
      } else {
        return res.status(500).json({ error: 'Mercado Pago Internal server error' });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new MercadoPagoController();
