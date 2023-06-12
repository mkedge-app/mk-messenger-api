import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Tenant from '../models/Tenant';

class SessionController {
  async create(req: Request, res: Response) {
    const { usuario, senha } = req.body;

    try {
      // Verificar se o usuário existe
      const tenant = await Tenant.findOne({ usuario });
      if (!tenant) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se a senha está correta
      const senhaCorreta = await bcrypt.compare(senha, tenant.senha);
      if (!senhaCorreta) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Autenticação bem-sucedida
      return res.status(200).json({ message: 'Autenticação bem-sucedida' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao autenticar o tenant' });
    }
  }
}

export default new SessionController();
