# Visão Geral do Funcionamento do Servidor WebSocket

O servidor WebSocket é um componente essencial da aplicação responsável por lidar com as conexões dos clientes WebSocket e facilitar a interação entre os clientes e o gerenciador de sessões do WhatsApp. Ele atua como uma ponte de comunicação bidirecional, permitindo que os clientes WebSocket se conectem e interajam com a aplicação em tempo real.

## Funcionamento do Servidor WebSocket

1. **Inicialização:** O servidor WebSocket é inicializado quando a aplicação é iniciada. Ele cria um servidor WebSocket usando a biblioteca `ws` para aceitar conexões dos clientes.

2. **Conexões de Clientes:** Quando um cliente WebSocket se conecta ao servidor WebSocket, o servidor WebSocket aceita a conexão e cria uma instância WebSocket para esse cliente. Cada instância WebSocket representa uma conexão individual entre o cliente e o servidor.

3. **Autenticação do Cliente:** Após a conexão, o cliente envia um token de autenticação para o servidor. O servidor WebSocket autentica o cliente usando o middleware `AuthMiddleware`, que verifica a validade do token.

4. **Gerenciamento de Conexões:** O servidor WebSocket mantém uma lista de todas as conexões ativas dos clientes. Ele usa um objeto `SocketMap` para rastrear as conexões ativas, usando o `tenantId` como chave e a instância WebSocket como valor.

5. **Redirecionamento de Mensagens:** Quando um cliente WebSocket envia uma mensagem para o servidor, o servidor encaminha essa mensagem para o gerenciador de sessões do WhatsApp correspondente usando o `tenantId`. Ele usa o objeto `SocketMap` para localizar a instância WebSocket associada à sessão do WhatsApp.

6. **Receber Atualizações:** O servidor WebSocket recebe atualizações do gerenciador de sessões do WhatsApp através do `WebSocketDataSender`, que notifica o servidor sobre eventos importantes, como códigos QR para autenticação e atualizações de status da sessão.

7. **Enviar Mensagens para Clientes:** O servidor WebSocket também é responsável por enviar mensagens para os clientes. Ele recebe notificações do gerenciador de sessões do WhatsApp sobre eventos importantes, como códigos QR para autenticação e atualizações de status da sessão. Quando esses eventos ocorrem, o servidor envia as informações relevantes para os clientes correspondentes através das instâncias WebSocket.

## Interação com o WhatsAppSessionManager

O servidor WebSocket interage com o `WhatsAppSessionManager` para criar, autenticar e gerenciar as sessões do WhatsApp. Quando um cliente solicita a inicialização de uma sessão do WhatsApp, o servidor chama o método `initializeSession` do `WhatsAppSessionManager`, que cria uma nova sessão usando a biblioteca `@whiskeysockets/baileys`. O gerenciador de sessões do WhatsApp gera um código QR para autenticação e o envia para o servidor WebSocket através do `WebSocketDataSender`, que por sua vez envia o código QR para o cliente WebSocket correspondente.

O servidor WebSocket também recebe atualizações do `WhatsAppSessionManager` sobre eventos importantes, como desconexões e atualizações de status da sessão. Quando esses eventos ocorrem, o servidor WebSocket notifica os clientes WebSocket correspondentes através das instâncias WebSocket, garantindo que os clientes tenham informações atualizadas sobre o status de suas sessões do WhatsApp.

Em resumo, o servidor WebSocket é responsável por gerenciar as conexões dos clientes WebSocket, encaminhar mensagens para o gerenciador de sessões do WhatsApp e enviar notificações para os clientes sobre eventos importantes relacionados às sessões do WhatsApp. Ele desempenha um papel crítico na facilitação da comunicação em tempo real entre os clientes e o gerenciador de sessões do WhatsApp, tornando possível a interação em tempo real com as sessões do WhatsApp através da aplicação.