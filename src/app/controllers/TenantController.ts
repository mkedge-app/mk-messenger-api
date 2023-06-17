import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Tenant from '../models/Tenant';

class TenantController {
  /**
   * Method to fetch all tenants
   */
  async index(req: Request, res: Response) {
    try {
      const tenants = await Tenant.find();
      return res.status(200).json(tenants);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar tenants' });
    }
  }

  /**
   * Method to fetch a single tenant by id
   */
  async show(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const tenant = await Tenant.findById(id);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant não encontrado' });
      }
      return res.status(200).json(tenant);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter tenant' });
    }
  }

  /**
   * Method to create a new tenant
   */
  async create(req: Request, res: Response) {
    const {
      cnpj,
      responsavel,
      contato,
      provedor,
      database,
      assinatura,
      usuario,
      senha
    } = req.body;

    const hashPwd = await bcrypt.hash(senha, 10)

    try {
      const tenant = await Tenant.create({
        cnpj,
        responsavel,
        contato,
        provedor,
        database,
        assinatura,
        usuario,
        senha: hashPwd,
      });
      return res.status(201).json(tenant);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar tenant' });
    }
  }

  /**
   * Method to delete a tenant by ID
   */
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const deletedTenant = await Tenant.findByIdAndDelete(id);
      if (!deletedTenant) {
        return res.status(404).json({ error: 'Tenant não encontrado' });
      }
      return res.status(200).json({ message: 'Tenant excluído com sucesso' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir tenant' });
    }
  }
}

export default new TenantController();
