import { Router } from "express";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import MessageLogController from "./app/controllers/MessageLogController";
import WhatsAppSessionController from "./app/controllers/WhatsAppSessionController";
import WhatsAppMessageController from "./app/controllers/WhatsAppMessageController";
import UserSubscriptionController from "./app/controllers/UserSubscriptionController";
import SubscriptionController from "./app/controllers/SubscriptionController";
import InvoiceController from "./app/controllers/InvoiceController";
import PaymentController from "./app/controllers/PaymentController";

import WebhookController from "./modules/mercado-pago/WebhookController";

import { authenticateUser } from "./middlewares/authenticateUser";
import { isAdminMiddleware } from "./middlewares/isAdminMiddleware";
import { isTenantMiddleware } from "./middlewares/isTenantMiddleware";
import { tenantStatusCheck } from "./middlewares/tenantStatusCheck";

const routes = Router();

// Rotas publicas
routes.post("/session", SessionController.create); // Login
routes.post("/mercadopago/webhook", WebhookController.index); // Webhook do Mercado Pago

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

// Rota para atrelar uma assinatura a um usuario
routes.post("/users/:userId/subscriptions/:subscriptionId", isAdminMiddleware, UserSubscriptionController.create);

// Rota para interação com assinaturas
routes.get("/subscriptions/:subscriptionId", isAdminMiddleware, SubscriptionController.show);
routes.get("/subscriptions/:subscriptionId/invoices", isAdminMiddleware, InvoiceController.show); // Obter faturas
routes.get("/subscriptions/:subscriptionId/invoices/:invoiceId/payments", isAdminMiddleware, PaymentController.show); // Obter pagamentos

// Rota para envio de mensagens
routes.post(
  "/whatsapp/sessions/:name/message",
  isTenantMiddleware,
  tenantStatusCheck,
  WhatsAppMessageController.create
);

export default routes;
