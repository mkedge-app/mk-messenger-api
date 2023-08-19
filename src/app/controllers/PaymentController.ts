import { Request, Response } from 'express';
import Fatura from '../models/Fatura';
import Payment from '../models/Payment';
import { Invoice } from '../../modules/mercado-pago/types';

class PaymentController {
  async show(req: Request, res: Response) {
    const { subscriptionId, invoiceId } = req.params;

    try {
      // Verifica se o ID da assinatura foi fornecido na requisição.
      if (!subscriptionId || !invoiceId) {
        return res.status(400).json({ error: 'O subscriptionId e invoiceId são obrigatórios' });
      }

      const invoice: Invoice | null = await Fatura.findById(invoiceId);

      // Verifique se invoice é nulo (não encontrado).
      if (!invoice) {
        return res.status(404).json({ error: 'Fatura não encontrada' });
      }

      // Obtenha o ID do pagamento a partir da fatura.
      const paymentId = invoice.payment.id;

      // Consulte o pagamento pelo ID.
      const payment = await Payment.findById(paymentId);

      // Verifique se o pagamento foi encontrado.
      if (!payment) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }

      // Retorne os dados do pagamento como resposta JSON.
      return res.json(payment);
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      return res.status(500).json({ error: 'Erro ao buscar pagamento' });
    }
  }
}

export default new PaymentController();

