import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/authentication';

export const isAdminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { userType } = req;

  if (userType === 'admin') {
    // O usuário é um administrador, permitir o acesso
    next();
  } else {
    // O usuário não é um administrador, negar o acesso
    return res.status(403).json({ error: 'Access denied. Only administrators are allowed.' });
  }
};
