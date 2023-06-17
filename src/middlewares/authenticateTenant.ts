import { NextFunction, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";
import { AuthenticateTenantResponse, AuthenticatedRequest, DecodedToken } from "../types/authentication";

export const authenticateTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<AuthenticateTenantResponse> => {
  // Verificar se o cabeçalho de autorização (Authorization) está presente na requisição
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  // Verifica se o cabeçalho de autenticação contém um token válido
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return res.status(401).json({ error: "Token inválido" });
  }

  try {
    // Verifica e decodifica o token
    const decodedToken = jwt.verify(token, JWT_CONFIG.secret) as DecodedToken;

    // Verifica se existe um valor para tenantId e isTenantActive dentro do token
    if (!decodedToken.hasOwnProperty('tenantId') || !decodedToken.hasOwnProperty('isTenantActive')) {
      return res.status(401).json({ error: "O token não contém as informações necessárias" });
    }

    // Adiciona o tenantId ao objeto de requisição para uso posterior
    req.tenantId = decodedToken.tenantId;
    req.isTenantActive = decodedToken.isTenantActive;

    // Continua para o próximo middleware ou rota
    next();
  } catch (error) {
    const jwtError = error as VerifyErrors;

    if (jwtError.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido" });
    } else if (jwtError.name === "NotBeforeError") {
      return res.status(401).json({ error: "Token ainda não é válido" });
    } else if (jwtError.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    } else if (jwtError.name === "SignatureVerificationError") {
      return res.status(401).json({ error: "Erro na verificação da assinatura do token" });
    }

    // Tratamento de outros erros não específicos
    return res.status(500).json({ error: "Erro ao processar o token" });
  }
};
