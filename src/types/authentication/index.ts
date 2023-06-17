import { Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  tenantId?: string;
  isTenantActive?: boolean;
}

export interface DecodedToken {
  tenantId: string;
  isTenantActive: boolean;
}

export type AuthenticateTenantResponse = Response<Record<string, any>> | void;
