import AuthUtils from "../../../services/AuthUtils";

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

  public extractTenantId(token: string): string | undefined {
    try {
      const decodedToken = AuthUtils.verifyToken(token);
      if (decodedToken && decodedToken.tenantId) {
        return decodedToken.tenantId;
      }
    } catch (error) {
      return undefined;
    }
  }
}

export default TokenValidator;
