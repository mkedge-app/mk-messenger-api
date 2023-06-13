import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";

export interface AuthenticatedRequest extends Request {
  tenantId?: string;
  isTenantActive?: boolean;
}

interface DecodedToken {
  tenantId: string;
  isTenantActive: boolean;
}

// Middleware para autenticação do tenantId
export const AuthenticateTenant = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response<any, Record<string, any>> | void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return res.status(401).json({ error: "Token inválido" });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_CONFIG.secret) as DecodedToken;

    if (!decodedToken.tenantId) {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Adiciona o tenantId ao objeto de requisição para uso posterior
    req.tenantId = decodedToken.tenantId;
    req.isTenantActive = decodedToken.isTenantActive;

    // Continua para o próximo middleware ou rota
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
