import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import WhatsAppApi from "../../services/WhatsAppApi";

class WhatsappController {
  async create(req: AuthenticatedRequest, res: Response) {
    if (!req.tenantId) {
      return res
        .status(500)
        .json({ error: "tenantId não especificado na requisição" });
    }

    const userAlreadyInitializedInstance =
      await WhatsAppApi.verifyIfUserHasSession(req.tenantId);

    if (userAlreadyInitializedInstance) {
      return res
        .status(400)
        .json({ error: "Usuário já iniciou uma instância" });
    }

    try {
      const response = await WhatsAppApi.initInstance(req.tenantId);

      const old = response.data.qrcode.url;

      const qrcode = old.replace(
        "http://localhost:3333",
        "http://localhost:3000"
      );

      return res.status(200).json({ qrcode });
    } catch (err) {
      return res.status(500).json({ error: "Erro ao iniciar instância" });
    }
  }

  async show(req: Request, res: Response) {
    if (!req.params.key) {
      return res
        .status(500)
        .json({ error: "Instance key não especificado na requisição" });
    }

    try {
      const response = await WhatsAppApi.listAllSessions(req.params.key);

      return res.status(200).json(response);
    } catch (err) {
      return res.status(500).json({ error: "Erro ao listar instâncias" });
    }
  }
}

export default new WhatsappController();
