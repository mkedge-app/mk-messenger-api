import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Tenant from '../models/Tenant';
import SessionController from '../controllers/SessionController';

describe('SessionController', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {} as Request;
    res = {} as Response;
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
  });

  describe('create', () => {
    it('should return 401 if user is not found', async () => {
      req.body = { usuario: 'test', senha: 'password' };
      Tenant.findOne = jest.fn().mockResolvedValue(null);

      await SessionController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
    });

    it('should return 401 if password is incorrect', async () => {
      req.body = { usuario: 'test', senha: 'password' };
      Tenant.findOne = jest.fn().mockResolvedValue({ senha: 'hashedPassword' });
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await SessionController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Senha incorreta' });
    });

    it('should return 200 with token and expiresIn if authentication is successful', async () => {
      req.body = { usuario: 'test', senha: 'password' };
      const tenant = { id: 'tenantId', assinatura: { ativa: true } };
      Tenant.findOne = jest.fn().mockResolvedValue(tenant);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue('token');

      await SessionController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'token', expiresIn: expect.any(Number) });
    });

    it('should return 500 if an error occurs', async () => {
      req.body = { usuario: 'test', senha: 'password' };
      Tenant.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      await SessionController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erro ao autenticar o tenant' });
    });
  });
});
