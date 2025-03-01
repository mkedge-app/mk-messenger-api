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

  /**
   * Method to update the status of a user
   */
  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Id é obrigatório" });
    }

    if (!status || !['active', 'suspended', 'trial'].includes(status)) {
      return res.status(400).json({ error: "Status inválido. Os status válidos são: active, suspended, trial" });
    }

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User não encontrado' });
      }

      // Se o status for suspenso, definimos a data de suspensão
      if (status === 'suspended') {
        user.suspendedAt = new Date();
      } else {
        user.suspendedAt = null; // Limpa a data de suspensão se o status não for 'suspended'
      }

      user.status = status;

      await user.save();

      return res.status(200).json({ message: `Status do usuário atualizado para ${status}`, user });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar status do usuário' });
    }
  }
}

export default new UserController();
