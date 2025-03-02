import { NextFunction, Response } from 'express';
import { VerifyErrors } from 'jsonwebtoken';
import AuthUtils from '../services/AuthUtils';
import { AuthenticatedRequest } from '../types/authentication';
import User from '../app/models/User'; // Importa o modelo de usuário

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return AuthUtils.handleTokenMissing(res);
  }

  const [scheme, token] = authHeader.split(' ');

  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return AuthUtils.handleInvalidToken(res);
  }

  try {
    const decodedToken = AuthUtils.verifyToken(token);
    const { userId, userType } = decodedToken;

    if (!userId || !userType) {
      return AuthUtils.handleMissingInfo(res);
    }

    // Verifica se o usuário ainda existe
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(401).json({ error: 'Usuário não encontrado ou removido.' });
    }

    req.userId = userId;
    req.userType = userType;
    req.userStatus = userExists.status;

    next();
  } catch (error) {
    const jwtError = error as VerifyErrors;
    return AuthUtils.handleTokenError(res, jwtError);
  }
};
