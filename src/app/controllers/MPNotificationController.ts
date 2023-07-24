// src/controllers/MPNotificationController.ts
import { Request, Response } from "express";

export class MPNotificationController {
  public handleNotification(req: Request, res: Response): void {
    // Obtenha os detalhes do evento do corpo da solicitação
    const eventData = req.body;
    console.log("Recebido evento do Mercado Pago:", eventData);

    // Verifique o tipo de evento recebido
    const eventType = eventData.type;

    // Trate os diferentes tipos de eventos usando switch/case
    switch (eventType) {
      case "payment":
        this.handlePaymentEvent(eventData);
        break;
      case "plan":
        this.handlePlanEvent(eventData);
        break;
      case "subscription":
        this.handleSubscriptionEvent(eventData);
        break;
      case "invoice":
        this.handleInvoiceEvent(eventData);
        break;
      case "point_integration_wh":
        this.handlePointIntegrationEvent(eventData);
        break;
      // Adicione outros casos de acordo com os tipos de evento que você deseja tratar
      default:
        console.log("Evento não tratado:", eventType);
        break;
    }

    // Responda com HTTP 200 OK para confirmar o recebimento da notificação
    res.status(200).send();
  }

  private handlePaymentEvent(eventData: any): void {
    // Lógica para tratar evento de pagamento
    console.log("Evento de pagamento tratado:", eventData);
  }

  private handlePlanEvent(eventData: any): void {
    // Lógica para tratar evento de plano
    console.log("Evento de plano tratado:", eventData);
  }

  private handleSubscriptionEvent(eventData: any): void {
    // Lógica para tratar evento de assinatura
    console.log("Evento de assinatura tratado:", eventData);
  }

  private handleInvoiceEvent(eventData: any): void {
    // Lógica para tratar evento de fatura
    console.log("Evento de fatura tratado:", eventData);
  }

  private handlePointIntegrationEvent(eventData: any): void {
    // Lógica para tratar evento de integração de ponto
    console.log("Evento de integração de ponto tratado:", eventData);
  }
}

export default new MPNotificationController();
