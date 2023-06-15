import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import WhatsAppApi from "../../services/WhatsAppApi";

class WhatsappController {
  async create(req: AuthenticatedRequest, res: Response) {
    if (!req.tenantId) {
      return res.status(500).json({ error: "TenantId não existe" });
    }

    try {
      const response = await WhatsAppApi.initInstance(req.tenantId);

      if (!response) {
        return res.status(400).json({ error: "Usuário já iniciou uma instância" });
      }

      const old = response.data.qrcode.url;

      const qrcode = old.replace('http://localhost:3333', 'http://localhost:3000')

      console.log(qrcode)

      return res.status(200).json({ qrcode });
    } catch (err) {
      console.log(err);
    }
  }

  async index(req: AuthenticatedRequest, res: Response) {
    if (!req.tenantId) {
      return res.status(500).json({ error: "TenantId não existe" });
    }

    try {
      const response = await WhatsAppApi.listAllSessions(req.tenantId);

      return res.status(200).json(response);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new WhatsappController();
