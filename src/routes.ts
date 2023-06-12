import { Router } from 'express';

import TenantController from './app/controllers/TenantController';
import SessionController from './app/controllers/SessionController';

const routes = Router();

// Rotas dos tenants
routes.get('/tenants', TenantController.index);
routes.post('/tenants', TenantController.create);
routes.get('/tenants/:id', TenantController.show);
routes.delete('/tenants/:id', TenantController.delete);

// Rota de autenticação
routes.post('/session', SessionController.create);

export default routes;
