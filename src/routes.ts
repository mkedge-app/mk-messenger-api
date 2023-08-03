import { Router } from "express";
import SessionController from "./app/controllers/SessionController";
import TenantController from "./app/controllers/TenantController";
import WhatsAppSessionController from "./app/controllers/WhatsAppSessionController";
import WhatsAppMessageController from "./app/controllers/WhatsAppMessageController";

import { authenticateUser } from "./middlewares/authenticateUser";
import { tenantStatusCheck } from "./middlewares/tenantStatusCheck";

const routes = Router();

// Rota de autenticação
routes.post("/session", SessionController.create);

// Aplicar middleware de autenticação
routes.use(authenticateUser);

// Rotas dos tenants
routes.get("/tenants", TenantController.index);
routes.post("/tenants", TenantController.create);
routes.get("/tenants/:id", TenantController.show);
routes.delete("/tenants/:id", TenantController.delete);

// Rotas de interação com o gerenciador de sessões WhatsApp
routes.get("/whatsapp/sessions", WhatsAppSessionController.index);
routes.get("/whatsapp/sessions/:name", WhatsAppSessionController.show);
routes.delete("/whatsapp/sessions/:name", WhatsAppSessionController.delete);
routes.patch("/whatsapp/sessions/:name", WhatsAppSessionController.update);

// Rota para envio de mensagens
routes.post("/whatsapp/sessions/:name/message", WhatsAppMessageController.create);

export default routes;
