import bcrypt from "bcrypt";
import { Request, Response } from "express";
import SessionController from "../controllers/SessionController";
import Tenant from "../models/Tenant";

jest.mock("../models/Tenant");

describe("SessionController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let sessionController = SessionController;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create", () => {
    it("should authenticate the user and return a success message", async () => {
      mockRequest.body = { usuario: "john", senha: "password" };
      const mockTenant = {
        usuario: "john",
        senha: "hashedPassword",
        assinatura: { ativa: true },
      };
      Tenant.findOne = jest.fn().mockResolvedValue(mockTenant);
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      await sessionController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Tenant.findOne).toHaveBeenCalledWith({ usuario: "john" });
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashedPassword");

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should handle user not found and return 401 status", async () => {
      mockRequest.body = { usuario: "john", senha: "password" };
      Tenant.findOne = jest.fn().mockResolvedValue(null);

      await sessionController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Tenant.findOne).toHaveBeenCalledWith({ usuario: "john" });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Usuário não encontrado",
      });
    });

    it("should handle incorrect password and return 401 status", async () => {
      mockRequest.body = { usuario: "john", senha: "password" };
      const mockTenant = { usuario: "john", senha: "hashedPassword" };
      Tenant.findOne = jest.fn().mockResolvedValue(mockTenant);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await sessionController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Tenant.findOne).toHaveBeenCalledWith({ usuario: "john" });
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "hashedPassword");
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Senha incorreta",
      });
    });

    it("should handle error and return 500 status", async () => {
      mockRequest.body = { usuario: "john", senha: "password" };
      Tenant.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

      await sessionController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erro ao autenticar o tenant",
      });
    });
  });
});
