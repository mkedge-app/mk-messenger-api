import { Request, Response } from 'express';
import Fatura from "../models/Fatura";

class InvoiceController {
  async show(req: Request, res: Response) {
    // Obtém o ID da assinatura a partir dos parâmetros da requisição.
    const { subscriptionId } = req.params;

    // Verifica se o ID da assinatura foi fornecido na requisição.
    if (!subscriptionId) {
      return res.status(400).json({ error: 'O ID da assinatura é obrigatório' });
    }

    // Use a função `find` para buscar faturas com preapproval_id igual a subscriptionId.
    const invoices = await Fatura.find({ preapproval_id: subscriptionId });

    return res.json(invoices);
  }
}

export default new InvoiceController();
