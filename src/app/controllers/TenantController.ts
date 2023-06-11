import { Request, Response } from 'express';
import Tenant from '../models/Tenant';

class TenantController {
  /**
   * Method to fetch all tenants
   */
  async index(req: Request, res: Response) {
    try {
      const tenants = await Tenant.find();
      res.status(200).json(tenants);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar tenants' });
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
      res.status(200).json(tenant);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter tenant' });
    }
  }
}

export default new TenantController();
