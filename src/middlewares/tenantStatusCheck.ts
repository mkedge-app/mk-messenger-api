import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/authentication';

export const tenantStatusCheck = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // O status já está disponível na requisição, não precisamos buscar no banco novamente
    if (!req.userStatus) {
      return res.status(400).json({ message: 'User status not found in request' });
    }

    if (req.userStatus === 'suspended') {
      return res.status(403).json({ message: 'User is suspended and cannot send messages' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
