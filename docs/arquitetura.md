# Arquitetura do Projeto

## Visão Geral da Arquitetura

O projeto é uma aplicação que utiliza Node.js para fornecer uma API REST e um servidor WebSocket para gerenciar sessões do WhatsApp. A arquitetura é projetada para permitir a comunicação bidirecional entre clientes conectados ao WebSocket e o gerenciador de sessões WhatsApp, permitindo o envio e recebimento de mensagens pelo WhatsApp.

Aqui está uma visão geral da arquitetura:

1. **API REST:**
   A API REST é implementada usando o framework Express.js. Ela fornece endpoints para autenticação, gerenciamento de tenants e interação com o gerenciador de sessões do WhatsApp.

2. **Servidor WebSocket:**
   O servidor WebSocket é criado usando a biblioteca `ws`. Ele permite a comunicação em tempo real com os clientes conectados, como aplicativos ou interfaces web, para receber atualizações sobre o estado das sessões do WhatsApp e enviar informações como o código QR para autenticação.

3. **WhatsAppSessionManager:**
   O `WhatsAppSessionManager` é responsável por gerenciar as sessões do WhatsApp. Ele utiliza a biblioteca `@whiskeysockets/baileys` para criar e interagir com as sessões do WhatsApp. O gerenciador é responsável por inicializar sessões, lidar com a autenticação e receber e enviar mensagens pelo WhatsApp.

4. **Banco de Dados:**
   Embora não esteja detalhado neste arquivo, o projeto utiliza um banco de dados para armazenar informações dos tenants, como suas credenciais do WhatsApp e o estado das sessões.

## Fluxo de Dados

A seguir, descreveremos o fluxo de dados básico do projeto:

1. **Inicialização do Servidor:**
   Quando o servidor Node.js é iniciado, o `App` é criado. Ele configura o servidor Express, o servidor WebSocket e inicia o gerenciador de sessões do WhatsApp.

2. **Autenticação do Cliente WebSocket:**
   Quando um cliente WebSocket se conecta, o servidor solicita um token de autenticação. O cliente deve fornecer esse token no momento da conexão. O token é validado pelo middleware `AuthMiddleware` para autenticar o cliente.

3. **Gerenciamento de Tenants e Sessões:**
   Uma vez autenticado, o cliente pode interagir com os endpoints da API REST para gerenciar os tenants e suas sessões do WhatsApp. As informações dos tenants são armazenadas no banco de dados.

4. **Iniciação de Sessão do WhatsApp:**
   Quando um cliente solicita a inicialização de uma sessão do WhatsApp, o `WhatsAppSessionManager` cria uma nova sessão utilizando a biblioteca `@whiskeysockets/baileys`. O código QR para autenticação é enviado ao cliente através do WebSocket.

5. **Autenticação do WhatsApp:**
   O cliente deve escanear o código QR para autenticar a sessão do WhatsApp. Quando a sessão é autenticada, o WebSocket é notificado sobre a conexão estabelecida.

6. **Envio e Recebimento de Mensagens:**
   Com a sessão do WhatsApp autenticada, o cliente pode enviar mensagens para contatos no WhatsApp através do WebSocket. O `WhatsAppSessionManager` recebe as mensagens e as envia através da sessão do WhatsApp.

7. **Notificações e Atualizações:**
   O `WhatsAppSessionManager` e o servidor WebSocket podem enviar notificações e atualizações para o cliente sobre o status das sessões, recebimento de novas mensagens pelo WhatsApp ou erros na conexão.

Essa é uma visão geral da arquitetura. A documentação deve ser atualizada à medida que o projeto evolui e novos recursos são adicionados.