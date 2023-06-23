import AuthUtils from "../../services/AuthUtils";

class TokenValidator {
  public validateToken(token: string): boolean {
    try {
      const decodedToken = AuthUtils.verifyToken(token);

      // If the decoded token is missing the required properties, handle the missing info error
      if (!decodedToken.hasOwnProperty('tenantId') || !decodedToken.hasOwnProperty('isTenantActive')) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

export default TokenValidator;
