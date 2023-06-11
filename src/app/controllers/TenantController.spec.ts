import { Request, Response } from 'express';
import TenantController from '../controllers/TenantController';
import Tenant from '../models/Tenant';

describe('TenantController', () => {
  describe('index method', () => {
    test('should return all tenants', async () => {
      const mockTenants = [{ name: 'Tenant 1' }, { name: 'Tenant 2' }];
      jest.spyOn(Tenant, 'find').mockResolvedValueOnce(mockTenants);
      const mockRequest = {} as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await TenantController.index(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTenants);
    });

    test('should return 500 if there is an error', async () => {
      jest.spyOn(Tenant, 'find').mockRejectedValueOnce(new Error('Database error'));
      const mockRequest = {} as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await TenantController.index(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro ao listar tenants' });
    });
  });

  describe('show method', () => {
    test('should return a single tenant by id', async () => {
      const mockTenant = { name: 'Tenant 1' };
      jest.spyOn(Tenant, 'findById').mockResolvedValueOnce(mockTenant);
      const mockRequest = {
        params: { id: '123' },
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await TenantController.show(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTenant);
    });

    test('should return 404 if tenant is not found', async () => {
      jest.spyOn(Tenant, 'findById').mockResolvedValueOnce(null);
      const mockRequest = {
        params: { id: '123' },
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await TenantController.show(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Tenant não encontrado' });
    });

    test('should return 500 if there is an error', async () => {
      jest.spyOn(Tenant, 'findById').mockRejectedValueOnce(new Error('Database error'));
      const mockRequest = {
        params: { id: '123' },
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await TenantController.show(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro ao obter tenant' });
    });
  });
});
