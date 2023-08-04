import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/authentication';

export const tenantStatusCheck = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Como verifico se um tenant está elegível a disparar uma mensagem?
  next();
}
