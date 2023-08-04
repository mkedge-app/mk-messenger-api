import TokenValidator from "../validators/TokenValidator";

class AuthMiddleware {
  private tokenValidator: TokenValidator;

  constructor() {
    this.tokenValidator = new TokenValidator();
  }

  public handleConnection(
    token: string,
    callback: (authenticated: boolean, userId?: string) => void
  ): void {
    if (!token) {
      callback(false);
      return;
    }

    const authenticated = this.tokenValidator.validateToken(token);
    const userId = this.tokenValidator.extractUserId(token);

    callback(authenticated, userId);
  }
}

export default AuthMiddleware;
