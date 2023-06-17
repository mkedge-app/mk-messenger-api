import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './auth';

export const tenantStatusCheck = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const isTenantActive = req.isTenantActive;

  if (!isTenantActive) {
    return res.status(403).json({ error: "Assinatura expirada" });
  }

  next();
}
