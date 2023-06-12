import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './auth';

export const isSubscriptionActive = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // console.log(req.isTenantActive)

  if (!req.isTenantActive) {
    return res.status(403).json({ error: 'Assinatura expirada' });
  }

  next();
}
