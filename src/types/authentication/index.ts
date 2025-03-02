import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userType?: string;
  userStatus?: string;
}

export interface DecodedToken {
  userId: string;
  userType: string;
}
