
# 🎯 Objetivo desse projeto
    Melhorar o fluxo de desenvolvimento com:

        1. IA de CODIFICAÇÃO CONTEXTUAL
            * Entende múltiplos arquivos
            * Ajuda refatoração grande
            * Analisa arquitetura

        2. IA de ANÁLISE (backend + banco)
            * Queries complexas
            * Performance
            * Prisma + SQL Server tuning

        3. IA de PRODUTIVIDADE
            * Geração de documentação
            * Swagger automático melhorado
            * Testes
    
    Aumentar drasticamente a produtividade do desenvolvedor através de:

        * Geração automática de código
        * Análise de queries e performance
        * Criação de integrações frontend/backend
        * Padronização de arquitetura
        * Refatoração assistida por IA

---

# 🧠 AI-MCP - Ambiente Inteligente de Desenvolvimento
    Este projeto fornece uma camada de **integração com IA (Model Context Protocol - MCP)** para auxiliar no desenvolvimento de software com múltiplas stacks.

    Ele permite que ferramentas de IA (como o Continue.dev) entendam **todo o ecossistema do projeto**, incluindo:

        * Banco de dados (SQL Server)
        * APIs (Swagger)
        * Backend (NestJS / Laravel)
        * Frontend (React / NextJS / Flutter)
        * Estrutura do código

---

# 🧰 Tecnologias utilizadas
    ## Editor
        * Visual Studio Code

    ## AGENTES DE IA
        * GitHub Copilot (autocomplete)
        * Continue.dev (IA contextual com MCP)

    ## CONFIGURADO PARA MINHA STACK
        ## Backend
            * NestJS (TypeScript)
            * Laravel (PHP)

        ## Frontend
            * NextJS + React + Material UI
            * Flutter (Dart)

        ## Banco de Dados
            * SQL Server
                * Instalar dependências
                    * npm init -y (caso ainda não tenho inicializado o node ainda)
                    * npm install mssql

    ## Integrações MCP usadas
        * MCP SQL Server (queries e análise)
            * Analisa essa query
            * Sugere índice
            * Converte para Prisma

        * MCP HTTP Swagger (documentação e endpoints)
            A IA passa a:
                * entender endpoints
                * gerar chamadas frontend automaticamente
                * validar contratos

        * MCP Prisma (modelagem de dados)
            Você pode expor:
                * schema.prisma
                * migrations

                👉 IA passa a:
                    * entender relações
                    * sugerir queries corretas
                    * evitar erro de modelagem

        * MCP Laravel (estrutura backend PHP)

        * MCP Flutter (estrutura mobile)

        * MCP Terminal (execução de comandos)
            Permite IA rodar comandos:
                * migrate
                * test
                * build

---

# ⚙️ Instalação
    * 1. Clonar repositório

    * 2. Instalar dependências
        Executar na raiz do projeto:
            npm install

    * 3. Configurar variáveis de ambiente no .env

    * 4. Iniciar o servidor MCP local
            node infra/ai/server.js

---

# 🔌 Configuração no Continue.dev
    Adicionar no arquivo:
        ~/.continue/config.json

            ```json
            {
            "contextProviders": 
                [
                    {
                    "name": "sql-server",
                    "command": "node ./infra/ai/mcp/sql-server/sql-server.js"
                    },
                    {
                    "name": "swagger",
                    "command": "node ./infra/ai/mcp/swagger/swagger.js"
                    },
                    {
                    "name": "prisma",
                    "command": "node ./infra/ai/mcp/prisma/prisma.js"
                    },
                    {
                    "name": "laravel",
                    "command": "node ./infra/ai/mcp/laravel/laravel.js"
                    },
                    {
                    "name": "flutter",
                    "command": "node ./infra/ai/mcp/flutter/flutter.js"
                    },
                    {
                    "name": "nextjs",
                    "command": "node ./infra/ai/mcp/nextjs/nextjs.js"
                    },
                    {
                    "name": "nestjs",
                    "command": "node ./infra/ai/mcp/nestjs/nestjs.js"
                    },
                    {
                    "name": "terminal",
                    "command": "node ./infra/ai/mcp/terminal/terminal.js"
                    }
                ]
            }
            ```

    Os scripts acima aceitam JSON pela entrada padrão ou como argumento único.
    Exemplo rápido:

        echo "{\"projectPath\":\"C:/meu-projeto\",\"options\":{\"query\":\"SELECT 1\"}}" | node infra/ai/mcp/sql-server/sql-server.js

    O retorno será um JSON com `provider` e `result`.

    Também há um exemplo de configuração de Continue.dev em `.continue/config.json` no repositório.
    Se preferir usar a configuração global do Continue.dev, copie esse arquivo para `~/.continue/config.json`.

---

# 🚀 Como utilizar

    ## 🔹 Backend (NestJS / Laravel)
        ```
        @prisma Explique os relacionamentos
        @laravel Liste controllers e models
        ```

    ---

    ## 🔹 Banco de Dados
        ```
        @sql-server Otimize essa query
        @sql-server Essa query precisa de índice?
        ```

    ---

    ## 🔹 APIs
        ```
        @swagger Liste endpoints de autenticação
        @swagger Gere DTOs baseados na API
        ```

    ---

    ## 🔹 Frontend
        ```
        @swagger Gere service para NextJS
        @flutter Crie tela de login
        ```

    ---

    ## 🔹 Execução
        ```
        @terminal Rode migration
        @terminal Execute build
        ```

    ---

    # 🔄 Fluxo recomendado
        1. Desenvolvedor abre projeto principal
        2. MCP lê contexto automaticamente
        3. IA responde com base no projeto real
        4. Código é validado antes de commit

    ---

    # 🎯 Resultado esperado
        Após configuração:
            * IA entende todo o sistema
            * Redução de tempo de desenvolvimento
            * Menos erros de integração
            * Mais padronização
            * Aumento de produtividade (até 70%)

    ---

# ⚙️ Foi usado um MCP Gateway?
    Não, pelos motivos:
        Gateway só faz sentido se:
            * equipe inteira for usar
            * quiser centralizar IA
            * controlar acesso
    
    Pode ser que com o crescimento deste projeto a necessidade apareça

---

# 👨‍💻 Autor - Djan Gomes Tavares
    Ambiente com MCP estruturado para desenvolvimento profissional com IA integrada ao fluxo de trabalho das minhas stacks.