import AuthUtils from "../../services/AuthUtils";

class TokenValidator {
  public validateToken(token: string): boolean {
    try {
      const decodedToken = AuthUtils.verifyToken(token);

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
