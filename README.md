# Sil Sistemas Platform Migration Wizard

Ferramenta desktop/web para importacao em massa de dados mestres e operacionais na plataforma SSP (Sil Sistemas Platform). Permite autenticacao via OTP, selecao de organizacao/empresa e upload de arquivos CSV para migracao de entidades via API.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?logo=typescript)
![Electron](https://img.shields.io/badge/Electron-28.0-47848F?logo=electron)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-06B6D4?logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-%E2%89%A5_18-339933?logo=node.js)

---

## Sobre o Projeto

O SSP Migration Wizard e uma aplicacao construida com Next.js e Electron que facilita a migracao de dados para a plataforma Sil Sistemas. A aplicacao segue os principios de Clean Architecture, DDD (Domain-Driven Design) e CQRS (Command Query Responsibility Segregation).

### Principais Funcionalidades

- **Autenticacao via OTP** — Login com envio de codigo via WhatsApp e validacao JWT
- **Selecao de contexto** — Escolha de organizacao e empresa a partir dos dados do token
- **Importacao de dados mestres** — Usuarios, Veiculos, Fabricantes de Veiculos, Modelos de Veiculos
- **Importacao Torre de Controle** — Rotas, Veiculos, Motoristas, Pontos de Entrega (em desenvolvimento)
- **Importacao Frigorifico** — Animais, Lotes, Abates, Cortes (em desenvolvimento)
- **Validacao client-side** — Validacao de CPF, email, enums e campos obrigatorios antes do envio
- **Parsing de CSV** — Deteccao automatica de separador (`,` ou `;`), normalizacao de datas, preservacao de zeros a esquerda
- **Templates de importacao** — Download em ZIP de templates CSV para cada entidade
- **Log de requisicoes** — Visualizacao em tempo real de todas as chamadas API com historico completo
- **Multiplataforma** — Funciona como app web ou desktop (macOS, Windows, Linux) via Electron

### Arquitetura

```
src/
├── domain/           # Entidades, value objects, interfaces de repositorio
├── application/      # Handlers de commands/queries, DTOs, domain events
├── infrastructure/   # Cliente API, servicos de importacao, adapters Electron
├── presentation/     # Componentes React, hooks, stores, paginas
├── shared/           # Tipos, utilitarios, erros e constantes compartilhados
└── di/               # Container IoC (Inversify)

electron/
├── main.ts           # Processo principal do Electron
├── preload.ts        # Bridge segura com whitelist de canais IPC
└── ipc/              # Handlers de commands, queries e env
```

### Servicos de Importacao Implementados

| Entidade                | Endpoint API                                               |
| ----------------------- | ---------------------------------------------------------- |
| Usuarios                | `POST /client-admin/base/v2/usuarios`                      |
| Veiculos                | `POST /client/tms-base/v2/veiculos`                        |
| Fabricantes de Veiculos | `POST /client/tms-base/v2/veiculos/fabricantes`            |
| Modelos de Veiculos     | `POST /client/tms-base/v2/veiculos/fabricante/{id}/modelo` |

---

## Pre-requisitos

| Ferramenta | Versao  | Finalidade                       |
| ---------- | ------- | -------------------------------- |
| Node.js    | >= 18.x | Runtime e gerenciador de pacotes |
| npm        | >= 9.x  | Gerenciamento de dependencias    |
| Git        | >= 2.x  | Controle de versao               |

### Instalacao

```bash
git clone https://github.com/marcelo-mozena/mignow.git
cd mignow
npm install
```

### Scripts Disponiveis

| Script                   | Descricao                                                            |
| ------------------------ | -------------------------------------------------------------------- |
| `npm run dev`            | Inicia o servidor de desenvolvimento Next.js (http://localhost:3000) |
| `npm run electron:dev`   | Inicia Next.js + Electron simultaneamente                            |
| `npm run build`          | Gera o export estatico do Next.js + distribuivel do Electron         |
| `npm run electron:build` | Mesmo que `build`                                                    |
| `npm run lint`           | Executa ESLint no projeto                                            |

> [!NOTE]
> Para desenvolvimento web (sem Electron), use `npm run dev`. Para o app desktop completo, use `npm run electron:dev`.

---

## Variaveis de Ambiente

A aplicacao **nao utiliza arquivos `.env`** para configuracao de API. A selecao de ambiente e feita em tempo de execucao pela interface do usuario (tela de login).

### URLs Base por Ambiente

As URLs sao definidas em `src/shared/constants/environments.ts`:

| Ambiente  | URL Base                                          |
| --------- | ------------------------------------------------- |
| `test`    | `https://api.platform.test.silsistemas.com.br`    |
| `staging` | `https://api.platform.staging.silsistemas.com.br` |
| `sandbox` | `https://api.platform.sandbox.silsistemas.com.br` |
| `prod`    | `https://api.platform.silsistemas.com.br`         |

### Variaveis de Processo

| Variavel   | Descricao                                       | Obrigatorio | Contexto      |
| ---------- | ----------------------------------------------- | ----------- | ------------- |
| `NODE_ENV` | Modo de execucao (`development` / `production`) | Nao         | Electron main |

### Arquivo `.env.ssp` (gerado automaticamente)

Quando executado via Electron, a aplicacao gera um arquivo `.env.ssp` no diretorio de dados do usuario (`app.getPath('userData')`) contendo:

| Variavel                     | Descricao                    |
| ---------------------------- | ---------------------------- |
| `SSP_USER_NAME`              | Nome do usuario autenticado  |
| `SSP_USER_EMAIL`             | Email do usuario autenticado |
| `SSP_ENVIRONMENT`            | Ambiente selecionado         |
| `SSP_ORG_{n}_ID`             | ID da organizacao            |
| `SSP_ORG_{n}_COMPANY_{m}_ID` | ID da empresa na organizacao |

> [!IMPORTANT]
> Este arquivo e gerado automaticamente apos a autenticacao. Nao e necessario cria-lo manualmente.

---

## Autenticacao

A autenticacao utiliza o fluxo **OTP (One-Time Password) via WhatsApp** com tokens JWT.

### Fluxo de Autenticacao

1. **Envio do OTP** — O usuario informa o email e o ambiente. A aplicacao envia um `POST /oauth/v4/otp` que dispara o envio do codigo via WhatsApp.

2. **Validacao do token** — O usuario insere o codigo de 6 digitos. A aplicacao envia `POST /oauth/v4/token` com `grant_type: 'otp'` e recebe um `access_token` JWT.

3. **Decodificacao do JWT** — O token e decodificado no client-side para extrair: `name`, `sub` (email) e `orgs` (array de organizacoes com empresas).

4. **Enriquecimento** — Apos autenticacao, a aplicacao consulta `GET /client-admin/base/v1/organizacoes` e `GET /client-admin/base/v1/empresas` para obter os nomes de exibicao.

5. **Selecao de contexto** — O usuario seleciona a organizacao e empresa desejadas. Os headers `sil-organization` e `sil-company` sao adicionados a todas as requisicoes subsequentes.

### Modos de Configuracao

| Modo               | Header adicional       | Uso                        |
| ------------------ | ---------------------- | -------------------------- |
| Organization Setup | —                      | Fluxo padrao de importacao |
| Environment Setup  | `Sil-Backoffice: true` | Configuracao de ambiente   |

> [!NOTE]
> A validacao de assinatura do JWT nao e realizada no client-side. A autenticacao depende inteiramente da validacao server-side no endpoint `/oauth/v4/token`.

---

## Background Services

Esta aplicacao **nao utiliza background services**. Todas as operacoes sao interativas e executadas sob demanda pelo usuario:

- Importacoes sao realizadas sequencialmente (um registro por vez via chamada API)
- Nao ha Web Workers, Service Workers ou tarefas agendadas
- A comunicacao Electron IPC e sincrona (request/response via `ipcRenderer.invoke`)

### Canais IPC (Electron)

| Canal                | Tipo    | Finalidade                                 |
| -------------------- | ------- | ------------------------------------------ |
| `command:createUser` | Command | Criar usuario via CQRS                     |
| `command:updateUser` | Command | Atualizar usuario via CQRS                 |
| `query:getUser`      | Query   | Consultar usuario por ID                   |
| `query:listUsers`    | Query   | Listar usuarios                            |
| `env:saveOrgs`       | Utility | Salvar dados de organizacoes em `.env.ssp` |

> [!NOTE]
> Todos os canais IPC sao protegidos por whitelist no script preload com `contextIsolation: true` e `nodeIntegration: false`.
