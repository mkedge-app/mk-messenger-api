import { Request, Response } from "express";
import WhatsappService from "../../services/WhatsappService";
import WhatsappController from "./WhatsappController";

jest.mock("../../services/WhatsappService");

describe("WhatsappController", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  describe("create", () => {
    it("should return 500 with error message if key is missing", async () => {
      req.body = {};

      await WhatsappController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Chave key obrigatória" });
    });

    it("should return 400 with error message if session already exists", async () => {
      req.body = { key: "test_key" };
      (WhatsappService.getSessionByKey as jest.Mock).mockResolvedValueOnce(
        "test_session"
      );

      await WhatsappController.create(req, res);

      expect(WhatsappService.getSessionByKey).toHaveBeenCalledWith("test_key");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Usuário já iniciou uma sessão",
      });
    });

    it("should return 200 with qrcode when session is created", async () => {
      req.body = { key: "test_key" };
      (WhatsappService.getSessionByKey as jest.Mock).mockResolvedValueOnce(
        undefined
      );
      (WhatsappService.initInstance as jest.Mock).mockResolvedValueOnce({
        data: { qrcode: { url: "test_qrcode_url" } },
      });

      await WhatsappController.create(req, res);

      expect(WhatsappService.getSessionByKey).toHaveBeenCalledWith("test_key");
      expect(WhatsappService.initInstance).toHaveBeenCalledWith("test_key");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ qrcode: "test_qrcode_url" });
    });

    it("should return 500 with error message when failed to create session", async () => {
      req.body = { key: "test_key" };
      (WhatsappService.getSessionByKey as jest.Mock).mockResolvedValueOnce(
        undefined
      );
      (WhatsappService.initInstance as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to create session")
      );

      await WhatsappController.create(req, res);

      expect(WhatsappService.getSessionByKey).toHaveBeenCalledWith("test_key");
      expect(WhatsappService.initInstance).toHaveBeenCalledWith("test_key");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao iniciar sessão",
      });
    });
  });

  describe("show", () => {
    it("should return 400 with error message if session is not found", async () => {
      (WhatsappService.getSessionByKey as jest.Mock).mockResolvedValueOnce(
        undefined
      );
      req.params = { key: "lucas" };

      await WhatsappController.show(req, res);

      expect(WhatsappService.getSessionByKey).toHaveBeenCalledWith("lucas");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Sessão não encontrada" });
    });

    it("should return 200 with session data when session is found", async () => {
      (WhatsappService.getSessionByKey as jest.Mock).mockResolvedValueOnce(
        "test_session"
      );
      req.params = { key: "lucas" };

      await WhatsappController.show(req, res);

      expect(WhatsappService.getSessionByKey).toHaveBeenCalledWith("lucas");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith("test_session");
    });

    it("should return 500 with error message when failed to get session", async () => {
      (WhatsappService.getSessionByKey as jest.Mock).mockRejectedValueOnce(
        new Error("Failed to get session")
      );
      req.params = { key: "lucas" };

      await WhatsappController.show(req, res);

      expect(WhatsappService.getSessionByKey).toHaveBeenCalledWith("lucas");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Falha ao obter sessão" });
    });

    it('should return 500 with error message when failed to get session or initialize instance', async () => {
      req.body = { key: 'test_key' };
      (WhatsappService.getSessionByKey as jest.Mock).mockRejectedValueOnce(new Error('Failed to get session'));
      (WhatsappService.initInstance as jest.Mock).mockRejectedValueOnce(new Error('Failed to initialize instance'));

      await WhatsappController.create(req, res);

      expect(WhatsappService.getSessionByKey).toHaveBeenCalledWith('test_key');
      expect(WhatsappService.initInstance).toHaveBeenCalledWith('test_key');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao iniciar sessão' });
    });
  });
});
