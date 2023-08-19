import { Request, Response } from 'express';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async show(req: Request, res: Response) {
    try {
      // Obtém o ID da assinatura a partir dos parâmetros da requisição.
      const { subscriptionId } = req.params;

      // Verifica se o ID da assinatura foi fornecido na requisição.
      if (!subscriptionId) {
        return res.status(400).json({ error: 'O ID da assinatura é obrigatório' });
      }

      // Procura a assinatura pelo ID no banco de dados.
      const subscription = await Subscription.findById(subscriptionId);

      // Se a assinatura não for encontrada, retorna um erro 404.
      if (!subscription) {
        return res.status(404).json({ error: 'Assinatura não encontrada' });
      }

      // Retorna a assinatura encontrada como resposta JSON.
      return res.json(subscription);
    } catch (error) {
      // Em caso de erro, registra o erro no console e retorna uma resposta de erro com status 500.
      return res.status(500).json({ error: 'Erro ao obter assinatura' });
    }
  }
}

export default new SubscriptionController();
