# Fluxo de Dados do Projeto

O fluxo de dados no projeto envolve a comunicação entre os diferentes componentes da aplicação, incluindo a API REST, o servidor WebSocket e o gerenciador de sessões do WhatsApp. A seguir, descrevemos o fluxo de dados básico:

1. **Cliente WebSocket se Conecta:**
   Quando um cliente WebSocket se conecta ao servidor, ele envia um token de autenticação como parte do processo de handshake.

2. **Autenticação do Cliente:**
   O servidor valida o token de autenticação enviado pelo cliente para garantir que ele esteja autorizado a se conectar. O middleware `AuthMiddleware` é responsável por essa validação.

3. **Requisições à API REST:**
   Uma vez autenticado, o cliente pode fazer requisições à API REST para interagir com o gerenciador de tenants e sessões do WhatsApp. As requisições são tratadas pelos controladores correspondentes, como o `SessionController`, `TenantController` e `WhatsAppSessionController`.

4. **Inicialização da Sessão do WhatsApp:**
   Quando o cliente solicita a inicialização de uma sessão do WhatsApp através da API REST, o `WhatsAppSessionManager` cria uma nova sessão do WhatsApp usando a biblioteca `@whiskeysockets/baileys`. Um código QR é gerado e enviado ao cliente através do WebSocket para autenticação.

5. **Cliente Autentica a Sessão:**
   O cliente escaneia o código QR fornecido pelo servidor para autenticar a sessão do WhatsApp. O `WhatsAppSessionManager` aguarda até que o cliente faça a autenticação e, em seguida, é notificado sobre a conexão estabelecida.

6. **Envio e Recebimento de Mensagens:**
   Com a sessão do WhatsApp autenticada, o cliente pode enviar mensagens para contatos no WhatsApp através do WebSocket. O cliente envia uma mensagem ao servidor WebSocket, que por sua vez, encaminha a mensagem para o `WhatsAppSessionManager`. O gerenciador de sessões, então, envia a mensagem através da sessão do WhatsApp.

7. **Atualizações do Status da Sessão:**
   O `WhatsAppSessionManager` monitora o status da sessão do WhatsApp. Se a sessão for desconectada por algum motivo, como tempo limite ou logout, o gerenciador notifica o cliente através do WebSocket sobre a desconexão.

8. **Recebimento de Mensagens pelo WhatsApp:**
   Quando o WhatsApp recebe uma nova mensagem para a sessão autenticada, o `WhatsAppSessionManager` é notificado sobre a mensagem recebida. O gerenciador encaminha a mensagem para o cliente conectado através do WebSocket para notificá-lo sobre a nova mensagem.

9. **Fechamento da Conexão WebSocket:**
   Se o cliente WebSocket se desconectar, o servidor WebSocket remove a conexão do cliente e notifica o `WhatsAppSessionManager`. O gerenciador pode limpar a sessão associada ao cliente que se desconectou.

10. **Limpeza de Sessões Inativas:**
   O `WhatsAppSessionManager` pode realizar tarefas de limpeza para remover sessões inativas ou expiradas. Por exemplo, se um cliente se desconectar sem autenticar a sessão do WhatsApp, o gerenciador pode limpar a sessão não autenticada após um período de tempo para liberar recursos.

Essa é uma visão geral do fluxo de dados básico do projeto. A documentação deve ser atualizada à medida que novos recursos e interações são adicionados ao projeto.