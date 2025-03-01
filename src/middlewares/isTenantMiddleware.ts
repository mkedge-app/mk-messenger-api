import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/authentication';

export const isTenantMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { userType } = req;

  if (userType === 'tenant') {
    // O usuário é um tenant, permitir o acesso
    next();
  } else {
    // O usuário não é um administrador, negar o acesso
    return res.status(403).json({ error: 'Access denied. Only tenants are allowed.' });
  }
};
