import { Router } from "express";
import SessionController from "./app/controllers/SessionController";
import MessageLogController from "./app/controllers/MessageLogController";
import WhatsAppSessionController from "./app/controllers/WhatsAppSessionController";
import WhatsAppMessageController from "./app/controllers/WhatsAppMessageController";

import { authenticateUser } from "./middlewares/authenticateUser";
import { isAdminMiddleware } from "./middlewares/isAdminMiddleware";
import { isTenantMiddleware } from "./middlewares/isTenantMiddleware";
import { tenantStatusCheck } from "./middlewares/tenantStatusCheck";
import UserController from "./app/controllers/UserController";

const routes = Router();

// Rota de autenticação
routes.post("/session", SessionController.create);

// Aplicar middleware de autenticação
routes.use(authenticateUser);

// Rotas dos usuarios
routes.get("/user", isAdminMiddleware, UserController.index);
routes.post("/user", isAdminMiddleware, UserController.create);
routes.get("/user/:id", UserController.show);
routes.delete("/user/:id", isAdminMiddleware, UserController.delete);

// Rotas de interação com o gerenciador de sessões WhatsApp
routes.get("/whatsapp/sessions", isAdminMiddleware, WhatsAppSessionController.index);
routes.get("/whatsapp/sessions/:name", WhatsAppSessionController.show);
routes.delete("/whatsapp/sessions/:name", WhatsAppSessionController.delete);

// Rota para interação com o log de mensagens enviadas
routes.get("/messages", isAdminMiddleware, MessageLogController.index);
routes.get("/messages/:requester", MessageLogController.show);

// Rota para envio de mensagens
routes.post(
  "/whatsapp/sessions/:name/message",
  isTenantMiddleware,
  tenantStatusCheck,
  WhatsAppMessageController.create
);

export default routes;
