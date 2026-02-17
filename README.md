# Sil Sistemas Platform mIGRATION wizard

Ferramenta desktop robusta para automação e orquestração de migração de dados de grande escala para a Sil Sistemas Platform.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![.NET SDK](https://img.shields.io/badge/.NET-8.0-512bd4?logo=dotnet)
![C# Version](https://img.shields.io/badge/C%23-12-239120?logo=csharp)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Background Services](https://img.shields.io/badge/Services-Hangfire%20%7C%20PubSub%20%7C%20SignalR-red)

### Sobre o Projeto

O Sil Sistemas Platform mIGRATION wizard (mignow) é uma aplicação desktop robusta desenvolvida em Electron, React e TypeScript, seguindo rigorosos padrões de Clean Architecture e CQRS. Seu objetivo primordial é automatizar e orquestrar a migração massiva de dados para o ecossistema Sil Sistemas Platform (SSP), garantindo a integridade dos dados através de uma camada de validação offline prévia ao envio.

Principais funcionalidades:
- Validação multi-etapa de arquivos CSV/JSON com detecção inteligente de delimitadores e tipos de dados.
- Fluxo de trabalho desacoplado com arquitetura orientada a eventos para processos de importação não blocantes.
- Orquestração inteligente de envios sequenciais ou paralelos para os ambientes produtivos e de sandbox da plataforma.
- Interface intuitiva para seleção dinâmica de organizações, unidades operacionais e empresas.
- Inspeção e monitoramento de tráfego API em tempo real com logs detalhados de request/response e análise de latência.
- Suporte a modelos de dados complexos, incluindo veículos, fabricantes e relacionamentos de frota.

### Pré-requisitos

Para executar ou desenvolver este projeto localmente, você precisará de:
- .NET 8.0 SDK (necessário para os serviços de orquestração e backend da plataforma)
- Node.js 20.x ou superior
- Git e GitHub CLI

### Variáveis de Ambiente

> [!IMPORTANT]
> A configuração correta das variáveis de ambiente é essencial para que o wizard consiga se comunicar com as APIs da plataforma e executar os processos de validação corretamente.

| Variável | Descrição | Obrigatório | Exemplo |
|----------|-----------|-------------|---------|
| `NODE_ENV` | Define se a aplicação deve rodar em modo de desenvolvimento ou produção | Não | `development` |
| `API_ENVIRONMENT` | Define o ambiente padrão se não selecionado pelo usuário | Não | `staging` |

Para configurar as variáveis locais:
```bash
cp .env.example .env
# Editar .env com seus valores
```

### Autenticação

O sistema de autenticação é baseado no fluxo de **One-Time Password (OTP)**. O acesso é restrito a usuários autorizados da Sil Sistemas:
1. O usuário solicita o código de acesso informando o e-mail corporativo.
2. Após a validação do código, a aplicação recebe um **JWT (JSON Web Token)** de longa duração.
3. Este token é armazenado com segurança no estado da aplicação e incluído nos cabeçalhos de autorização (`Authorization: Bearer <token>`) de todas as chamadas subsequentes para os orquestradores da Sil Sistemas Platform.

## Background Services

- **Hangfire**: Gerenciamento de tarefas em segundo plano no ecossistema SSP, permitindo que as migrações mais pesadas sejam processadas de forma assíncrona sem bloquear o wizard.
- **SignalR**: Utilizado para fornecer feedback visual em tempo real sobre o progresso das importações no desktop através de conexões via WebSocket.
- **InMemoryEventBus**: Barramento de eventos interno utilizado para sincronizar componentes da interface e gerenciar eventos de domínio durante a validação de arquivos.
- **Google PubSub**: Orquestração de mensagens distribuídas para garantir que a consistência dos dados migrados seja replicada entre diferentes microsserviços da plataforma.
