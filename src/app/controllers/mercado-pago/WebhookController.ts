import { Request, Response } from "express";
import MercadoPagoService from "../../../modules/mercado-pago/MercadoPagoService";
import Subscription from "../../models/Subscription";
import Fatura from "../../models/Fatura";
import Payment from "../../models/Payment";

export class WebhookController {
  public async handleNotification(req: Request, res: Response): Promise<void> {
    try {
      // Obter os detalhes do evento do corpo da solicitação
      const eventData = req.body;
      console.log("Recebido evento do Mercado Pago:", eventData);

      // Responder com HTTP 200 OK para confirmar o recebimento da notificação
      res.status(200).send();

      // Processar o evento
      switch (eventData.type) {
        case 'subscription_preapproval':
          await this.handleSubscriptionPreapproval(eventData);
          break;
        case 'subscription_authorized_payment':
          await this.handleSubscriptionAuthorizedPayment(eventData);
          break;
        case 'payment':
          await this.handlePayment(eventData);
          break;
        default:
          console.log("Tipo de evento não reconhecido:", eventData.type);
          break;
      }
    } catch (error) {
      console.error("Erro ao processar o evento:", error);
    }
  }

  private async handleSubscriptionPreapproval(eventData: any): Promise<void> {
    const idAssinatura = eventData.data.id;
    const infoAssinatura = await MercadoPagoService.consultarDadosDaAssinatura(idAssinatura);
    await Subscription.findOneAndUpdate(
      { id: infoAssinatura.id },
      infoAssinatura,
      { upsert: true, new: true }
    );
  }

  private async handleSubscriptionAuthorizedPayment(eventData: any): Promise<void> {
    const idFatura = eventData.data.id;
    const infoFatura = await MercadoPagoService.consultarDadosDaFatura(idFatura);
    await Fatura.findOneAndUpdate(
      { id: infoFatura.id },
      infoFatura,
      { upsert: true, new: true }
    );
  }

  private async handlePayment(eventData: any): Promise<void> {
    const idPagamento = eventData.data.id;
    const infoPagamento = await MercadoPagoService.consultarDadosDoPagamento(idPagamento);
    console.log("Informações do pagamento:", infoPagamento);
    await Payment.findOneAndUpdate(
      { id: infoPagamento.id },
      infoPagamento,
      { upsert: true, new: true }
    );
  }
}

export default new WebhookController();
