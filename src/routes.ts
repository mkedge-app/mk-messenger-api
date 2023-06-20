import { Router } from "express";
import SessionController from "./app/controllers/SessionController";
import TenantController from "./app/controllers/TenantController";
import WhatsAppController from "./app/controllers/WhatsappController";

import { authenticateTenant } from "./middlewares/authenticateTenant";
import { tenantStatusCheck } from "./middlewares/tenantStatusCheck";
import WppSessionController from "./app/controllers/WppSessionController";

const routes = Router();

routes.post("/init", WppSessionController.create);

// Rota de autenticação
routes.post("/session", SessionController.create);

// Aplicar middleware de autenticação
routes.use(authenticateTenant);

// Rotas dos tenants
routes.get("/tenants", TenantController.index);
routes.post("/tenants", TenantController.create);
routes.get("/tenants/:id", TenantController.show);
routes.delete("/tenants/:id", TenantController.delete);

// Aplicar middleware de autenticação
routes.use(tenantStatusCheck);

// Rotas de interação com o WhatsApp
routes.post("/whatsapp/sessions", WhatsAppController.create);
routes.get("/whatsapp/sessions/:key", WhatsAppController.show);

export default routes;
