import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth";
import { IgetQRCodeData, IinitResponseData } from '../../types/WhatsApp';

class WhatsappController {
  async create(req: AuthenticatedRequest, res: Response) {
    const isTenantActive = req.isTenantActive;

    if (!isTenantActive) {
      return res.status(403).json({ error: "Assinatura expirada" });
    }

    try {
      const initInstanceResponse = await fetch(
        `http://localhost:3000/instance/init?key=${req.tenantId}&token=123`
      );
      const initInstanceData: IinitResponseData =
        await initInstanceResponse.json();

      setTimeout(async () => {
        const getQRCodeResponse = await fetch(
          `http://localhost:3000/instance/qrbase64?key=${initInstanceData.key}`
        );
        const { qrcode }: IgetQRCodeData = await getQRCodeResponse.json();

        return res.status(200).json({ qrcode });
      }, 1000);
    } catch (err) {
      console.log(err);
    }
  }
}

export default new WhatsappController();
