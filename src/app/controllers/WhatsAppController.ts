import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import WhatsAppApi from '../../services/WhatsAppApi';

class WhatsappController {
  async create(req: AuthenticatedRequest, res: Response) {
    if (!req.tenantId) {
      return res.status(500).json({ error: 'TenantId não existe' });
    }

    try {
      const response = await WhatsAppApi.initInstance(req.tenantId);

      const qrcode = response.data.qrcode.url;

      return res.status(200).json({qrcode});
    } catch (err) {
      console.log(err);
    }
  }
}

export default new WhatsappController();
