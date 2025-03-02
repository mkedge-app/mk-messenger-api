import TokenValidator from "../validators/TokenValidator";

class AuthMiddleware {
  private tokenValidator: TokenValidator;

  constructor() {
    this.tokenValidator = new TokenValidator();
  }

  public async handleConnection(
    token: string,
    callback: (authenticated: boolean, userId?: string) => Promise<void>
  ): Promise<void> {
    if (!token) {
      callback(false);
      return;
    }

    const authenticated = this.tokenValidator.validateToken(token);
    const userId = this.tokenValidator.extractUserId(token);

    await callback(authenticated, userId);
  }
}

export default AuthMiddleware;
