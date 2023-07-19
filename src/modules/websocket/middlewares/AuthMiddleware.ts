import TokenValidator from "../validators/TokenValidator";
import { IncomingMessage } from 'http';

class AuthMiddleware {
  private tokenValidator: TokenValidator;

  constructor() {
    this.tokenValidator = new TokenValidator();
  }

  public handleConnection(token: string, callback: (authenticated: boolean, tenantId?: string) => void): void {
    if (!token) {
      callback(false);
      return;
    }

    const authenticated = this.tokenValidator.validateToken(token);
    const tenantId = this.tokenValidator.extractTenantId(token);

    callback(authenticated, tenantId);
  }
}

export default AuthMiddleware;
