import TokenValidator from "../validators/TokenValidator";
import { IncomingMessage } from 'http';

class AuthMiddleware {
  private tokenValidator: TokenValidator;

  constructor() {
    this.tokenValidator = new TokenValidator();
  }

  public handleConnection(req: IncomingMessage, callback: (authenticated: boolean) => void): void {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      callback(false);
      return;
    }

    const authenticated = this.tokenValidator.validateToken(token);
    callback(authenticated);
  }
}

export default AuthMiddleware;
