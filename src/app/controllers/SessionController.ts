import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../../config/jwt';
import User from '../models/User';

class SessionController {
  async create(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      // Verificar se o usuário existe
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se a senha está correta
      const senhaCorreta = await bcrypt.compare(password, user.passwordHash);
      if (!senhaCorreta) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Gerar o token JWT
      const payload = { userId: user.id, userType: user.userType };

      const token = jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });

      // Autenticação bem-sucedida, retorne também o userType
      return res.status(200).json({ userId: user.id, userType: user.userType, token, expiresIn: parseInt(JWT_CONFIG.expiresIn) });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao autenticar o usuário' });
    }
  }
}

export default new SessionController();
