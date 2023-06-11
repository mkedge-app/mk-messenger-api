import { Request, Response } from 'express';
import HelloWorldController from './HelloWorldController';

describe('HelloWorldController', () => {
  test('index method should return JSON with ok property set to true', async () => {
    const mockRequest = {} as Request;
    const mockResponse = {
      json: jest.fn(),
    } as unknown as Response;

    await HelloWorldController.index(mockRequest, mockResponse);

    expect(mockResponse.json).toHaveBeenCalledWith({ ok: true });
  });
});
