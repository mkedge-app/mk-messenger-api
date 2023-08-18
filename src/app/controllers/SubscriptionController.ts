import { Request, Response } from 'express';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async show(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        return res.status(400).json({ error: 'O ID da assinatura é obrigatório' });
      }

      const subscription = await Subscription.findById(subscriptionId);

      if (!subscription) {
        return res.status(404).json({ error: 'Assinatura não encontrada' });
      }

      return res.json(subscription);
    } catch (error) {
      console.error('Erro ao obter assinatura:', error);
      return res.status(500).json({ error: 'Erro ao obter assinatura' });
    }
  }
}

export default new SubscriptionController();
