import { Router } from 'express';
import { AuthenticateTenant } from './middlewares/auth';
import TenantController from './app/controllers/TenantController';
import SessionController from './app/controllers/SessionController';

const routes = Router();

// Rota de autenticação
routes.post('/session', SessionController.create);

// Rotas dos tenants
routes.get('/tenants', AuthenticateTenant, TenantController.index);
routes.post('/tenants', AuthenticateTenant, TenantController.create);
routes.get('/tenants/:id', AuthenticateTenant, TenantController.show);
routes.delete('/tenants/:id', AuthenticateTenant, TenantController.delete);



export default routes;
