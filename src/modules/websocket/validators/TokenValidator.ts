import AuthUtils from "../../../services/AuthUtils";

class TokenValidator {
  public validateToken(token: string): boolean {
    try {
      const decodedToken = AuthUtils.verifyToken(token);

      if (!decodedToken.hasOwnProperty('userId') || !decodedToken.hasOwnProperty('userType')) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  public extractUserId(token: string): string | undefined {
    try {
      const decodedToken = AuthUtils.verifyToken(token);
      if (decodedToken && decodedToken.userId) {
        return decodedToken.userId;
      }
    } catch (error) {
      return undefined;
    }
  }
}

export default TokenValidator;
