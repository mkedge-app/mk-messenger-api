import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import WhatsAppSessionManager from '../../modules/whatsapp/WhatsAppSessionManager';

class UserController {
  async index(req: Request, res: Response) {
    try {
      const { userType, status } = req.query; // Pegando os parâmetros de query

      // Construindo filtro dinâmico
      const filter: any = {};

      // Se userType for passado, filtramos por ele
      if (userType && ['admin', 'tenant'].includes(userType as string)) {
        filter.userType = userType;
      }

      // Se status for passado, filtramos por ele
      if (status && ['active', 'suspended', 'trial'].includes(status as string)) {
        filter.status = status;
      }

      // Busca todos se não houver filtros
      const users = await User.find(filter);
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao listar users" });
    }
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;

    // Verifica se o ID foi fornecido na requisição.
    if (!id) {
      return res.status(400).json({ error: 'O ID é obrigatório' });
    }

    try {
      const user = await User.findById(id);

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
      return res.status(400).json({ error: 'Id é obrigatória' });
    }

    try {
      const userToDelete = await User.findById(id);
      if (!userToDelete) {
        return res.status(404).json({ error: 'User não encontrado' });
      }

      // Remove a sessão do WhatsApp antes de deletar o usuário
      WhatsAppSessionManager.deleteSession(userToDelete.id);

      // Agora deleta o usuário
      await User.findByIdAndDelete(id);

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
