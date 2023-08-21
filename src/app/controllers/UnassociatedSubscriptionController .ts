import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import User from '../models/User';

class UnassociatedSubscriptionController {
  async index(req: Request, res: Response) {
    try {
      // Consulta todos os usuários que têm uma assinatura associada.
      const usersWithSubscriptions = await User.find({ subscription: { $ne: null } });

      // Obtém os IDs das assinaturas associadas a usuários.
      const associatedSubscriptionIds = usersWithSubscriptions.map(user => user.subscription);

      // Consulta todas as assinaturas que não estão associadas a nenhum usuário.
      const unassociatedSubscriptions = await Subscription.find({ _id: { $nin: associatedSubscriptionIds } });

      // Retorna a lista de assinaturas não associadas.
      return res.json(unassociatedSubscriptions);
    } catch (error) {
      console.error('Erro ao listar assinaturas não associadas:', error);
      return res.status(500).json({ error: 'Erro ao listar assinaturas não associadas' });
    }
  }
}

export default new UnassociatedSubscriptionController();
