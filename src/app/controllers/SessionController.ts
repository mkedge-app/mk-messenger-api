import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../../config/jwt';
import User from '../models/User';

class SessionController {
  async create(req: Request, res: Response) {
    const { username, password } = req.body;

    // Verifica se os parâmetros "username" e "password" são fornecidos no corpo da solicitação.
    if (!username || !password) {
      return res.status(400).json({ error: 'Os parâmetros "username" e "password" são obrigatórios no corpo da solicitação' });
    }

    try {
      // Verificar se o usuário existe no banco de dados.
      const user = await User.findOne({ username });

      // Se o usuário não for encontrado, retorna um erro de autenticação.
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      // Verificar se a senha está correta
      const senhaCorreta = bcrypt.compareSync(password, user.passwordHash);
      if (!senhaCorreta) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      // Gerar um token JWT com base nas informações do usuário.
      const payload = { userId: user.id, userType: user.userType };
      const token = jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });

      // Responde com sucesso e inclui o token JWT, o ID do usuário e o tipo de usuário.
      return res.status(200).json({ userId: user.id, userType: user.userType, token, expiresIn: parseInt(JWT_CONFIG.expiresIn) });
    } catch (error) {
      // Em caso de erro interno, retorna um erro interno do servidor.
      return res.status(500).json({ error: 'Erro ao autenticar o usuário' });
    }
  }

}

export default new SessionController();
