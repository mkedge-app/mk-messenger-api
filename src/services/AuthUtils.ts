import { Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";
import { DecodedToken } from "../types/authentication";

class AuthUtils {
  /**
   * Verifies the authenticity of a token by decoding it.
   * @param token - The token to be verified.
   * @returns The decoded token.
   */
  verifyToken(token: string): DecodedToken {
    return jwt.verify(token, JWT_CONFIG.secret) as DecodedToken;
  }

  /**
 * Handles the case when the token is invalid.
 * @param res - The response object.
 * @returns The response object with a status of 401 and an error message.
 */
  handleInvalidToken(res: Response): Response<any, Record<string, any>> {
    return res.status(401).json({ error: "Token inválido" });
  }

  /**
   * Handles the case when the token is missing.
   * @param res - The response object.
   * @returns The response object with a status of 401 and an error message.
   */
  handleTokenMissing(res: Response): Response<any, Record<string, any>> {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  /**
   * Handles the case when the token is missing necessary information.
   * @param res - The response object.
   * @returns The response object with a status of 401 and an error message.
   */
  handleMissingInfo(res: Response): Response<any, Record<string, any>> {
    return res.status(401).json({ error: "O token não contém as informações necessárias" });
  }

  /**
   * Handles the case when there is an error with the token.
   * @param res - The response object.
   * @param jwtError - The error object from the JWT library.
   * @returns The response object with a status of 401 and an error message based on the type of error.
   * If the error is not recognized, the response object will have a status of 500 and a generic error message.
   */
  handleTokenError(res: Response, jwtError: VerifyErrors): Response<any, Record<string, any>> {
    const errorMessages: Record<string, string> = {
      JsonWebTokenError: "Token inválido",
      NotBeforeError: "Token ainda não é válido",
      TokenExpiredError: "Token expirado",
      SignatureVerificationError: "Erro na verificação da assinatura do token"
    };

    const errorName = jwtError.name;
    const errorMessage = errorMessages[errorName];

    if (errorMessage) {
      return res.status(401).json({ error: errorMessage });
    } else {
      return res.status(500).json({ error: "Erro ao processar o token" });
    }
  }
}

export default new AuthUtils();
