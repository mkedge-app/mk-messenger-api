import { Response } from "express";
import WhatsappController from "./WhatsAppController";
import { AuthenticatedRequest } from "../../middlewares/auth";
import WhatsAppApi from "../../services/WhatsAppApi";

jest.mock("../../services/WhatsAppApi");

describe("WhatsappController", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let whatsappController: typeof WhatsappController;

  beforeEach(() => {
    mockRequest = { tenantId: "123" };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    whatsappController = WhatsappController;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("should return 500 status if tenantId is not specified", async () => {
      const invalidRequest = {};

      await whatsappController.create(
        invalidRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "tenantId não especificado na requisição",
      });
    });

    it("should return 400 status if user has already initialized a session", async () => {
      WhatsAppApi.verifyIfUserHasSession = jest.fn().mockResolvedValue(true);

      await whatsappController.create(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Usuário já iniciou uma instância",
      });
    });

    it("should return qrcode url if instance is successfully initialized", async () => {
      const mockResponseData = {
        data: { qrcode: { url: "http://localhost:3333/qrcode.png" } },
      };
      WhatsAppApi.verifyIfUserHasSession = jest.fn().mockResolvedValue(false);
      WhatsAppApi.initInstance = jest.fn().mockResolvedValue(mockResponseData);

      await whatsappController.create(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      const expectedUrl = "http://localhost:3000/qrcode.png";
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ qrcode: expectedUrl });
    });

    it("should return 500 status if an error occurs while initializing instance", async () => {
      WhatsAppApi.verifyIfUserHasSession = jest.fn().mockResolvedValue(false);
      WhatsAppApi.initInstance = jest
        .fn()
        .mockRejectedValue(new Error("Failed to initialize instance"));

      await whatsappController.create(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erro ao iniciar instância",
      });
    });
  });

  describe("index", () => {
    it("should return 500 status if tenantId is not specified", async () => {
      const invalidRequest = {};

      await whatsappController.index(
        invalidRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "tenantId não especificado na requisição",
      });
    });

    it("should return all sessions if they exist", async () => {
      const mockResponseData = {
        data: [{ instance_key: "123", phone_connected: true }],
      };
      WhatsAppApi.listAllSessions = jest
        .fn()
        .mockResolvedValue(mockResponseData);

      await whatsappController.index(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResponseData);
    });

    it("should return 500 status if an error occurs while listing sessions", async () => {
      WhatsAppApi.listAllSessions = jest
        .fn()
        .mockRejectedValue(new Error("Failed to list sessions"));

      await whatsappController.index(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erro ao listar instâncias",
      });
    });
  });
});
