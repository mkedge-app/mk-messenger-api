import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

class UserController {
  async index(req: Request, res: Response) {
    try {
      // Consulta todos os usuários no banco de dados e popula o campo 'subscription'.
      const users = await User.find().populate('subscription');

      // Retorna a lista de usuários com suas assinaturas populadas como resposta JSON de sucesso (status 200).
      return res.status(200).json(users);
    } catch (error) {
      // Em caso de erro durante a consulta, registra o erro e retorna uma resposta de erro (status 500).
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    // Verifica se o ID foi fornecido na requisição.
    if (!id) {
      return res.status(400).json({ error: 'O ID é obrigatório' });
    }

    try {
      // Consulta o usuário pelo ID no banco de dados e popula o campo 'subscription'.
      const user = await User.findById(id).populate('subscription');

      // Se o usuário não for encontrado, retorna um erro 404.
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Retorna o usuário com sua assinatura populada como resposta JSON de sucesso (status 200).
      return res.status(200).json(user);
    } catch (error) {
      // Em caso de erro durante a consulta, registra o erro e retorna uma resposta de erro (status 500).
      console.error('Erro ao obter usuário:', error);
      return res.status(500).json({ error: 'Erro ao obter usuário' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, contactPhone, contactEmail, username, passwordHash, userType } = req.body;

      if (!name || !contactPhone || !contactEmail || !username || !passwordHash || !userType) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      // Verificar se o username já está em uso
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "O nome de usuário já está em uso" });
      }

      // Verificar se o email já está em uso
      const existingEmailUser = await User.findOne({ contactEmail });
      if (existingEmailUser) {
        return res.status(400).json({ error: "O email já está em uso" });
      }

      // Hash a senha antes de salvar
      const hashedPassword = await bcrypt.hash(passwordHash, 10);

      const newUser = await User.create({
        name,
        contactPhone,
        contactEmail,
        username,
        passwordHash: hashedPassword,
        userType,
      });

      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar novo usuário' });
    }
  }

  /**
   * Method to delete a user by ID
   */
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Id é obrigatória" });
    }

    try {
      const deletedUser = await User.findByIdAndDelete(id);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User não encontrado' });
      }
      return res.status(200).json({ message: 'User excluído com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir user' });
    }
  }
}

export default new UserController();
