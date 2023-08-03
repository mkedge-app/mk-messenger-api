import { Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userType?: string;
}

export interface DecodedToken {
  userId: string;
  userType: string;
}

export type AuthenticateTenantResponse = Response<Record<string, any>> | void;
