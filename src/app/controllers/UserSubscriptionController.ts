import { Request, Response } from 'express';
import User from '../models/User';
import Subscription from '../models/Subscription';

class UserSubscriptionController {
  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const subscriptionId = req.params.subscriptionId;

    // Validar se userId e subscriptionId foram enviados como strings não vazias
    if (!userId || !subscriptionId) {
      return res.status(400).json({ error: 'Parâmetros "userId" e "subscriptionId" são obrigatórios' });
    }

    try {
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (user.userType !== 'tenant') {
        return res.status(400).json({ error: 'Apenas tenants podem ter assinaturas' });
      }

      // Verificar se a assinatura existe
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: 'Assinatura não encontrada' });
      }

      // Verificar se outro usuário já possui a mesma assinatura
      const userWithSubscription = await User.findOne({ subscription: subscriptionId });
      if (userWithSubscription && userWithSubscription._id.toString() !== userId) {
        return res.status(400).json({ error: 'Outro usuário já possui esta assinatura' });
      }

      // Verificar se o usuário já possui outra assinatura
      if (user.subscription && user.subscription !== subscriptionId) {
        return res.status(400).json({ error: 'Usuário já possui outra assinatura' });
      }

      // Atualizar a assinatura do usuário e salvar no banco de dados
      user.subscription = subscriptionId;
      await user.save();

      // Retornar a resposta de sucesso com o usuário atualizado
      return res.json({ success: true, user });
    } catch (error) {
      // Em caso de erro, retornar uma resposta de erro com status 500
      return res.status(500).json({ error: 'Erro ao definir assinatura' });
    }
  }
}

export default new UserSubscriptionController();
