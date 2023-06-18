import { Request, Response } from "express";
import WhatsappService from "../../services/WhatsappService";

class WhatsappController {
  /**
   * Cria uma nova sessão no WhatsApp.
   */
  async create(req: Request, res: Response) {
    // Verifica se a chave "key" está presente no corpo da solicitação
    if (!req.body.key) {
      return res
        .status(500)
        .json({ error: "Chave key obrigatória" });
    }

    try {
      // Verifica se já existe uma sessão com a chave fornecida
      const session = await WhatsappService.getSessionByKey(req.body.key);

      if (session) {
        return res.status(400).json({ error: "Usuário já iniciou uma sessão" });
      }

      try {
        // Inicia uma nova instância do WhatsApp e obtém o URL do QR code
        const response = await WhatsappService.initInstance(req.body.key);
        const qrcode = response.data.qrcode.url;

        // Retorna o URL do QR code como resposta bem-sucedida
        return res.status(200).json({ qrcode });
      } catch (err) {
        // Retorna uma resposta de erro caso ocorra uma falha ao iniciar a sessão
        return res.status(500).json({ error: "Erro ao iniciar sessão" });
      }
    } catch (error) {
      // Retorna uma resposta de erro caso ocorra uma falha ao obter a sessão
      return res.status(500).json({ error: "Erro ao iniciar sessão" });
    }
  }

  /**
   * Retrieves a session by key and returns it as a JSON response.
   */
  async show(req: Request, res: Response) {
    // Check if the key parameter is missing
    if (!req.params.key) {
      return res
        .status(400)
        .json({ error: "Chave key obrigatória" });
    }

    try {
      // Retrieve the session by key
      const session = await WhatsappService.getSessionByKey(req.params.key);

      // Check if the session was not found
      if (!session) {
        return res.status(400).json({ error: "Sessão não encontrada" });
      }

      // Return the session as a JSON response
      return res.status(200).json(session);
    } catch (err) {
      // Return an error response if there was a failure
      return res.status(500).json({ error: "Falha ao obter sessão" });
    }
  }
}

export default new WhatsappController();
