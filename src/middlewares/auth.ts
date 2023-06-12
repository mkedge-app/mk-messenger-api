import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from "../config/jwt";

interface AuthenticatedRequest extends Request {
  tenantId?: string;
}

// Middleware para autenticação do tenantId
export const AuthenticateTenant = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'Token inválido' });
  }

  try {
    const decodedToken = jwt.verify(token, JWT_CONFIG.secret) as { tenantId: string };

    if (!decodedToken.tenantId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Adiciona o tenantId ao objeto de requisição para uso posterior
    req.tenantId = decodedToken.tenantId;

    // Continua para o próximo middleware ou rota
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
