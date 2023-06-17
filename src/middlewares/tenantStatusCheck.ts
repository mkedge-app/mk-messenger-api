import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '../types/authentication';

export const tenantStatusCheck = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const isTenantActive = req.isTenantActive;

  if (!isTenantActive) {
    return res.status(403).json({ error: "Assinatura expirada" });
  }

  next();
}
