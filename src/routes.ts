import { Router } from "express";
import SessionController from "./app/controllers/SessionController";
import TenantController from "./app/controllers/TenantController";
import WhatsAppController from "./app/controllers/WhatsAppController";
import { AuthenticateTenant } from "./middlewares/auth";
import { tenantStatusCheck } from "./middlewares/tenantStatusCheck";

const routes = Router();

// Rota de autenticação
routes.post("/session", SessionController.create);

// Rotas dos tenants
routes.get("/tenants", AuthenticateTenant, TenantController.index);
routes.post("/tenants", TenantController.create);
routes.get("/tenants/:id", AuthenticateTenant, TenantController.show);
routes.delete("/tenants/:id", AuthenticateTenant, TenantController.delete);

// Rotas de interação com o WhatsApp
routes.post(
  "/whatsapp/sessions",
  AuthenticateTenant,
  tenantStatusCheck,
  WhatsAppController.create
);
routes.get(
  "/whatsapp/sessions/instances",
  AuthenticateTenant,
  tenantStatusCheck,
  WhatsAppController.index
);

export default routes;
