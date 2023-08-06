import { Request, Response } from 'express';
import { Types } from 'mongoose';
import User from '../models/User';
import Subscription from '../models/Subscription';

class SetSubscriptionController {
  async create(req: Request, res: Response) {
    const { userId, subscriptionId } = req.body;

    try {
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se a assinatura existe
      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: 'Assinatura não encontrada' });
      }

      // Verificar se outro usuário já possui a mesma assinatura
      const userWithSubscription = await User.findOne({ subscription: new Types.ObjectId(subscriptionId) });
      if (userWithSubscription && userWithSubscription._id.toString() !== userId) {
        return res.status(400).json({ error: 'Outro usuário já possui esta assinatura' });
      }

      // Verificar se o usuário já possui outra assinatura
      if (user.subscription && user.subscription.toString() !== subscriptionId) {
        return res.status(400).json({ error: 'Usuário já possui outra assinatura' });
      }

      // Atualizar a assinatura do usuário e salvar no banco de dados
      user.subscription = new Types.ObjectId(subscriptionId); // Converte para ObjectId
      await user.save();

      // Retornar a resposta de sucesso com o usuário atualizado
      return res.json({ success: true, user });
    } catch (error) {
      // Em caso de erro, retornar uma resposta de erro com status 500
      return res.status(500).json({ error: 'Erro ao definir assinatura' });
    }
  }
}

export default new SetSubscriptionController();
