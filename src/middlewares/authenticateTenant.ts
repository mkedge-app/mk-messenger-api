import { NextFunction, Response } from "express";
import { VerifyErrors } from "jsonwebtoken";
import AuthUtils from "../services/AuthUtils";
import { AuthenticateTenantResponse, AuthenticatedRequest } from "../types/authentication";

export const authenticateTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<AuthenticateTenantResponse> => {
  // Get the authorization header from the request
  const authHeader = req.headers.authorization;

  // If the authorization header is missing, handle the missing token error
  if (!authHeader) {
    return AuthUtils.handleTokenMissing(res);
  }

  // Split the authorization header into scheme and token
  const [scheme, token] = authHeader.split(" ");

  // If the scheme or token is missing, or the scheme is not "bearer", handle the invalid token error
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return AuthUtils.handleInvalidToken(res);
  }

  try {
    // Verify the token and decode its payload
    const decodedToken = AuthUtils.verifyToken(token);

    // If the decoded token is missing the required properties, handle the missing info error
    if (!decodedToken.hasOwnProperty('tenantId') || !decodedToken.hasOwnProperty('isTenantActive')) {
      return AuthUtils.handleMissingInfo(res);
    }

    // Set the tenantId and isTenantActive properties on the request object
    req.tenantId = decodedToken.tenantId;
    req.isTenantActive = decodedToken.isTenantActive;

    // Call the next function
    next();
  } catch (error) {
    // If there is an error verifying the token, handle the token error
    const jwtError = error as VerifyErrors;
    return AuthUtils.handleTokenError(res, jwtError);
  }
};
