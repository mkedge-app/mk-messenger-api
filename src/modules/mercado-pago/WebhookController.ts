import { Request, Response } from 'express';
import logger from '../../logger';
import Fatura from '../../app/models/Fatura';
import Payment from '../../app/models/Payment';
import Subscription from '../../app/models/Subscription';
import MercadoPagoService from './MercadoPagoService';
import { EventMapping } from './types';

class WebhookController {
  constructor() {
    this.index = this.index.bind(this);  // Bind the index method to the correct context
  }

  // Mapeamento de manipuladores de eventos
  private eventHandlers: EventMapping = {
    'subscription_preapproval': this.handleSubscriptionPreapproval,
    'subscription_authorized_payment': this.handleSubscriptionAuthorizedPayment,
    'payment': this.handlePayment
  };

  /**
   * Manipula a notificação do webhook do Mercado Pago.
   * @param req - Objeto de requisição Express.
   * @param res - Objeto de resposta Express.
   */
  public async index(req: Request, res: Response): Promise<void> {
    try {
      const eventData = req.body;

      // Obtém o manipulador de evento correspondente ao tipo de evento recebido
      const eventHandler = this.eventHandlers[eventData.type];

      // Se existe um manipulador de evento válido, execute-o
      if (eventHandler) {
        try {
          await eventHandler(eventData);
          // Responde com status 200 OK após a conclusão bem-sucedida
          res.status(200).send();
        } catch (error) {
          // Registra o erro no logger
          logger.error("Erro ao processar o evento:", error);
          // Responde com status 500 Internal Server Error em caso de erro
          res.status(500).send();
        }
      } else {
        // Registra evento não reconhecido no logger
        logger.warn("Tipo de evento não reconhecido:", eventData.type);
        // Responde com status 200 OK para confirmação de recebimento (pode ser ajustado conforme a necessidade)
        res.status(200).send();
      }
    } catch (error) {
      // Registra erro no logger
      logger.error("Erro ao processar a requisição:", error);
      // Responde com status 500 Internal Server Error em caso de erro
      res.status(500).send();
    }
  }

  private async handleSubscriptionPreapproval(eventData: any): Promise<void> {
    const idAssinatura = eventData.data.id;
    const infoAssinatura = await MercadoPagoService.consultarDadosDaAssinatura(idAssinatura);
    const updatedData = { ...infoAssinatura, _id: idAssinatura };
    await Subscription.findOneAndUpdate({ _id: idAssinatura }, updatedData, { upsert: true, new: true });
  }

  private async handleSubscriptionAuthorizedPayment(eventData: any): Promise<void> {
    const idFatura = eventData.data.id;
    const infoFatura = await MercadoPagoService.consultarDadosDaFatura(idFatura);
    const updatedData = { ...infoFatura, _id: idFatura };
    await Fatura.findOneAndUpdate({ _id: idFatura }, updatedData, { upsert: true, new: true });
  }

  private async handlePayment(eventData: any): Promise<void> {
    const idPagamento = eventData.data.id;
    const infoPagamento = await MercadoPagoService.consultarDadosDoPagamento(idPagamento);
    const updatedData = { ...infoPagamento, _id: idPagamento };
    await Payment.findOneAndUpdate({ _id: idPagamento }, updatedData, { upsert: true, new: true });
  }
}

export default new WebhookController();