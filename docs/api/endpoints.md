# Endpoints da API REST

A API REST do projeto fornece endpoints para interagir com o gerenciador de tenants e sessões do WhatsApp. A seguir, estão listados os principais endpoints disponíveis:

## Autenticação

- `POST /session`: Autentica um cliente WebSocket através do envio de um token de autenticação. O cliente deve enviar o token no corpo da solicitação como JSON.

## Gerenciamento de Tenants

- `GET /tenants`: Retorna uma lista de todos os tenants cadastrados no sistema.

- `POST /tenants`: Cria um novo tenant com base nas informações fornecidas no corpo da solicitação como JSON. O corpo da requisição deve conter os dados do tenant, como nome, descrição, etc.

- `GET /tenants/:id`: Retorna as informações detalhadas de um tenant específico com base no ID fornecido na URL.

- `DELETE /tenants/:id`: Exclui um tenant específico com base no ID fornecido na URL.

## Gerenciamento de Sessões do WhatsApp

- `GET /whatsapp/sessions`: Retorna uma lista de todas as sessões do WhatsApp que foram criadas.

- `GET /whatsapp/sessions/:name`: Retorna informações detalhadas de uma sessão do WhatsApp específica com base no nome fornecido na URL.

- `DELETE /whatsapp/sessions/:name`: Encerra e remove a sessão do WhatsApp específica com base no nome fornecido na URL.

- `PATCH /whatsapp/sessions/:name`: Atualiza as configurações de uma sessão do WhatsApp específica com base no nome fornecido na URL. O corpo da requisição deve conter os dados a serem atualizados.

## Gerenciamento de Mensagens do WhatsApp

- `POST /whatsapp/sessions/:name/message`: Envia uma mensagem de texto para um contato no WhatsApp. O nome fornecido na URL corresponde ao nome da sessão do WhatsApp pela qual a mensagem será enviada. O corpo da requisição deve conter os detalhes da mensagem, como o número de telefone do contato e o texto da mensagem.

## Considerações

- Todos os endpoints, exceto o de autenticação, requerem que o cliente seja autenticado para acessá-los. O middleware `authenticateTenant` é responsável por verificar a autenticação em todos os endpoints, exceto os endpoints de autenticação.

- Alguns endpoints requerem a verificação do status do tenant antes de processar a solicitação. O middleware `tenantStatusCheck` é aplicado a esses endpoints para garantir que o tenant esteja em um estado válido antes de continuar o processamento da solicitação.

- O projeto pode ser estendido com mais endpoints para adicionar funcionalidades adicionais, como enviar imagens, arquivos ou mensagens para grupos do WhatsApp, entre outras.

- As respostas da API são em formato JSON, fornecendo informações detalhadas sobre o resultado da requisição.

Essa é uma visão geral dos principais endpoints disponíveis na API REST do projeto. Os endpoints podem ser expandidos e personalizados de acordo com os requisitos específicos da aplicação e das funcionalidades a serem implementadas. A documentação deve ser atualizada à medida que novos endpoints são adicionados ou modificações são feitas nos endpoints existentes.