# MK-Messenger API

Este repositório contém o código-fonte da MK-Messenger API. A API permite que os usuários enviem e recebam mensagens através da plataforma MK-Messenger.

## Padronização do Código

Para manter a consistência e formatação do código em nosso projeto, utilizamos o EditorConfig. É importante que todos os desenvolvedores tenham a extensão do EditorConfig instalada em seus editores de código.

A extensão do EditorConfig está disponível para diversos editores populares, como Visual Studio Code, Sublime Text, Atom e outros. Ela nos permite definir regras de formatação e estilo de código, garantindo que todos sigam as mesmas convenções.

Para baixar e instalar a extensão do EditorConfig em seu editor de código, siga as instruções abaixo:

1. **Visual Studio Code**: Procure por "EditorConfig" na loja de extensões do Visual Studio Code e clique em "Instalar".

2. **Sublime Text**: Instale o pacote "EditorConfig" usando o Package Control. Consulte a documentação oficial do Sublime Text para mais informações.

3. **Atom**: Procure por "EditorConfig" no gerenciador de pacotes do Atom e clique em "Instalar".

Certifique-se de reiniciar o seu editor de código após a instalação da extensão do EditorConfig. Isso garantirá que as configurações de formatação do projeto sejam aplicadas automaticamente.

## Configuração do MongoDB

### Requisitos
- Docker instalado em sua máquina

### Instruções de Uso

1. Clone o repositório para o seu ambiente local.
2. No diretório raiz do projeto, crie um arquivo chamado `.env` e preencha com as seguintes informações:

MONGODB_USERNAME=seu_usuario
MONGODB_PASSWORD=sua_senha
MONGODB_PORT=sua_porta

3. Execute o seguinte comando para iniciar o banco de dados MongoDB:

docker-compose up -d

Isso iniciará um contêiner Docker com o MongoDB configurado usando as informações fornecidas no arquivo `.env`.

### Observações

- Certifique-se de fornecer valores válidos para `MONGODB_USERNAME` e `MONGODB_PASSWORD` no arquivo `.env`.
- O banco de dados estará acessível na porta especificada em `MONGODB_PORT`
- O contêiner do MongoDB será nomeado como `mongodb-mk-messenger`.

