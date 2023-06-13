import { Router } from 'express';
import { AuthenticateTenant } from './middlewares/auth';
import TenantController from './app/controllers/TenantController';
import SessionController from './app/controllers/SessionController';
import WhatsAppController from './app/controllers/WhatsAppController';
import { isSubscriptionActive } from './middlewares/isSubscriptionActive';

const routes = Router();

// Rota de autenticação
routes.post('/session', SessionController.create);

// Rotas dos tenants
routes.get('/tenants', AuthenticateTenant, TenantController.index);
routes.post('/tenants', TenantController.create);
routes.get('/tenants/:id', AuthenticateTenant, TenantController.show);
routes.delete('/tenants/:id', AuthenticateTenant, TenantController.delete);

// Rotas de interação com o WhatsApp
routes.get('/init-session', AuthenticateTenant, isSubscriptionActive, WhatsAppController.create)

export default routes;
