import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

class UserController {
  async index(req: Request, res: Response) {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar users' });
    }
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Id é obrigatória" });
    }

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User não encontrado' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter user' });
    }
  }

  /**
   * Method to create a new user
   */
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

      const hashedPassword = bcrypt.hashSync(passwordHash, 10);

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
