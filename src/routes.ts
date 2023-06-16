import { Router } from "express";
import SessionController from "./app/controllers/SessionController";
import TenantController from "./app/controllers/TenantController";
import WhatsAppController from "./app/controllers/WhatsAppController";

import { authenticateTenant } from "./middlewares/auth";
import { tenantStatusCheck } from "./middlewares/tenantStatusCheck";

const routes = Router();

// Rota de autenticação
routes.post("/session", SessionController.create);

// Rotas dos tenants
routes.get("/tenants", authenticateTenant, TenantController.index);
routes.post("/tenants", TenantController.create);
routes.get("/tenants/:id", authenticateTenant, TenantController.show);
routes.delete("/tenants/:id", authenticateTenant, TenantController.delete);

// Rotas de interação com o WhatsApp
routes.post(
  "/whatsapp/sessions",
  authenticateTenant,
  tenantStatusCheck,
  WhatsAppController.create
);
routes.get(
  "/whatsapp/sessions/:key",
  authenticateTenant,
  tenantStatusCheck,
  WhatsAppController.show
);

export default routes;
