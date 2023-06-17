import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tenant from '../models/Tenant';
import { JWT_CONFIG } from '../../config/jwt';
import logger from '../../logger';

class SessionController {
  async create(req: Request, res: Response) {
    const { usuario, senha } = req.body;

    try {
      // Verificar se o usuário existe
      const tenant = await Tenant.findOne({ usuario });
      if (!tenant) {
        logger.info(`Usuário não encontrado: ${usuario}`);
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se a senha está correta
      const senhaCorreta = await bcrypt.compare(senha, tenant.senha);
      if (!senhaCorreta) {
        logger.info(`Senha incorreta para o usuário: ${usuario}`);
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Gerar o token JWT
      const payload = { tenantId: tenant.id, isTenantActive: tenant.assinatura.ativa };

      const token = jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });

      logger.info(`Autenticação bem-sucedida para o usuário: ${usuario}`);

      // Autenticação bem-sucedida
      return res.status(200).json({ token, expiresIn: parseInt(JWT_CONFIG.expiresIn) });
    } catch (error) {
      logger.error(`Erro ao autenticar o tenant: ${error}`);
      return res.status(500).json({ error: 'Erro ao autenticar o tenant' });
    }
  }
}

export default new SessionController();
