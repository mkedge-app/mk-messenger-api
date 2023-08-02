// src/controllers/MPNotificationController.ts
import { Request, Response } from "express";
import MercadoPagoService from "../../../modules/mercado-pago/MercadoPagoService";
import Subscription from "../../models/Subscription";

export class WebhookController {
  public async handleNotification(req: Request, res: Response): Promise<void> {
    // Obtenha os detalhes do evento do corpo da solicitação
    const eventData = req.body;
    console.log("Recebido evento do Mercado Pago:", eventData);

    // Responda com HTTP 200 OK para confirmar o recebimento da notificação
    res.status(200).send();

    // Trate o evento aqui
    try {
      switch (eventData.type) {
        case 'subscription_preapproval':
          // Consulte informações da assinatura usando o ID da assinatura
          const idAssinatura = eventData.data.id;
          const infoAssinatura = await MercadoPagoService.consultarDadosDaAssinatura(idAssinatura);
          await Subscription.findOneAndUpdate(
            { id: infoAssinatura.id },
            infoAssinatura,
            { upsert: true, new: true }
          );
          break;
        case 'subscription_authorized_payment':
          // Consulte informações da fatura usando o ID da fatura
          const idFatura = eventData.data.id;
          const infoFatura = await MercadoPagoService.consultarDadosDaFatura(idFatura);
          console.log("Informações da fatura:", infoFatura);
          break;
        case 'payment':
          // Consulte informações do pagamento usando o ID do pagamento
          const idPagamento = eventData.data.id;
          const infoPagamento = await MercadoPagoService.consultarDadosDoPagamento(idPagamento);
          console.log("Informações do pagamento:", infoPagamento);
          break;
        default:
          console.log("Tipo de evento não reconhecido:", eventData.type);
          break;
      }
    } catch (error) {
      console.error("Erro ao processar o evento:", error);
    }
  }
}

export default new WebhookController();
