import jwt, { VerifyErrors } from "jsonwebtoken";
import { Response } from "express";
import AuthUtils from "./AuthUtils";
import { JWT_CONFIG } from "../config/jwt";

jest.mock("jsonwebtoken");

describe("AuthUtils", () => {
  describe("handleInvalidToken", () => {
    it("should return a response object with status 401 and an error message", () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      res.status.mockImplementation(() => res);
      res.json.mockImplementation(() => res);

      const result = AuthUtils.handleInvalidToken(res as Response<any, Record<string, any>>);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(result).toBe(res);
    });
  });

  describe("handleTokenMissing", () => {
    it("should return a response object with status 401 and an error message", () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      res.status.mockImplementation(() => res);
      res.json.mockImplementation(() => res);

      const result = AuthUtils.handleTokenMissing(res as Response<any, Record<string, any>>);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido" });
      expect(result).toBe(res);
    });
  });

  describe("handleMissingInfo", () => {
    it("should return a response object with status 401 and an error message", () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      res.status.mockImplementation(() => res);
      res.json.mockImplementation(() => res);

      const result = AuthUtils.handleMissingInfo(res as Response<any, Record<string, any>>);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "O token não contém as informações necessárias" });
      expect(result).toBe(res);
    });
  });

  describe("handleTokenError", () => {
    it("should return a response object with status 401 and an error message based on the type of error", () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      res.status.mockImplementation(() => res);
      res.json.mockImplementation(() => res);
      const jwtError = { name: "JsonWebTokenError" };

      const result = AuthUtils.handleTokenError(res as Response<any, Record<string, any>>, jwtError as VerifyErrors);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
      expect(result).toBe(res);
    });

    it("should return a response object with status 500 and a generic error message if the error is not recognized", () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      res.status.mockImplementation(() => res);
      res.json.mockImplementation(() => res);
      const jwtError = { name: "UnknownError" };

      const result = AuthUtils.handleTokenError(res as Response<any, Record<string, any>>, jwtError as VerifyErrors);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erro ao processar o token" });
      expect(result).toBe(res);
    });
  });

  describe("verifyToken", () => {
    it("should decode the token", () => {
      const token = JWT_CONFIG.secret;
      const decodedToken = { id: "exampleId" };
      jwt.verify = jest.fn().mockReturnValue(decodedToken);

      const result = AuthUtils.verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, JWT_CONFIG.secret);
      expect(result).toEqual(decodedToken);
    });

    it("should throw an error if the token verification fails", () => {
      const token = JWT_CONFIG.secret;
      const errorMessage = "Invalid token";
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(() => {
        AuthUtils.verifyToken(token);
      }).toThrowError(errorMessage);
    });
  });
});


