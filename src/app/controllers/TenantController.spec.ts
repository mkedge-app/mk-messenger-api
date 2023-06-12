import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Tenant from '../models/Tenant';
import TenantController from '../controllers/TenantController';

jest.mock('../models/Tenant');

describe('TenantController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let tenantController = TenantController;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('index', () => {
    it('should return all tenants', async () => {
      const mockTenants = [{ name: 'Tenant 1' }, { name: 'Tenant 2' }];
      Tenant.find = jest.fn().mockResolvedValue(mockTenants);

      await tenantController.index(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTenants);
    });

    it('should handle error and return 500 status', async () => {
      Tenant.find = jest.fn().mockRejectedValue(new Error('Database error'));

      await tenantController.index(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro ao listar tenants' });
    });
  });

  describe('show', () => {
    it('should return a single tenant by id', async () => {
      const mockTenant = { name: 'Tenant 1' };
      mockRequest.params = { id: '123' };
      Tenant.findById = jest.fn().mockResolvedValue(mockTenant);

      await tenantController.show(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTenant);
    });

    it('should handle tenant not found and return 404 status', async () => {
      mockRequest.params = { id: '123' };
      Tenant.findById = jest.fn().mockResolvedValue(null);

      await tenantController.show(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Tenant não encontrado' });
    });

    it('should handle error and return 500 status', async () => {
      mockRequest.params = { id: '123' };
      Tenant.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await tenantController.show(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro ao obter tenant' });
    });
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const mockTenantData = {
        cnpj: '123456789',
        responsavel: 'John Doe',
        contato: 'john@example.com',
        provedor: { nome: 'Provider 1' },
        database: { name: 'DB1', dialect: 'mysql', host: 'localhost', username: 'root', password: 'password' },
        assinatura: { valor: 100, data_vencimento: '2023-06-30', dia_vencimento: '30', ativa: true },
        usuario: 'john',
        senha: 'password',
      };

      const mockCreatedTenant = {
        _id: '123',
        ...mockTenantData,
      };

      mockRequest.body = mockTenantData;
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
      Tenant.create = jest.fn().mockResolvedValue(mockCreatedTenant);

      await tenantController.create(mockRequest as Request, mockResponse as Response);

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(Tenant.create).toHaveBeenCalledWith({
        ...mockTenantData,
        senha: 'hashedPassword',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedTenant);
    });

    it('should handle error and return 500 status', async () => {
      mockRequest.body = {
        cnpj: '123456789',
        responsavel: 'John Doe',
        contato: 'john@example.com',
        usuario: 'john',
        senha: 'password',
      };
      bcrypt.hash = jest.fn().mockResolvedValue('hashedPassword');
      Tenant.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await tenantController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro ao criar tenant' });
    });
  });

  describe('delete', () => {
    it('should delete a tenant by id', async () => {
      mockRequest.params = { id: '123' };
      const mockDeletedTenant = { _id: '123', name: 'Tenant 1' };
      Tenant.findByIdAndDelete = jest.fn().mockResolvedValue(mockDeletedTenant);

      await tenantController.delete(mockRequest as Request, mockResponse as Response);

      expect(Tenant.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Tenant excluído com sucesso' });
    });

    it('should handle tenant not found and return 404 status', async () => {
      mockRequest.params = { id: '123' };
      Tenant.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await tenantController.delete(mockRequest as Request, mockResponse as Response);

      expect(Tenant.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Tenant não encontrado' });
    });

    it('should handle error and return 500 status', async () => {
      mockRequest.params = { id: '123' };
      Tenant.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

      await tenantController.delete(mockRequest as Request, mockResponse as Response);

      expect(Tenant.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro ao excluir tenant' });
    });
  });
});
