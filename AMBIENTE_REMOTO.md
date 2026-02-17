# 🚀 Como Executar em Ambiente Remoto VS Code

## Pré-requisitos

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução
2. VS Code com a extensão [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Passos para Iniciar

### 1. Abrir no Container

```bash
# No VS Code, pressione F1 e digite:
Dev Containers: Reopen in Container
```

Ou clique no ícone verde no canto inferior esquerdo `><` e selecione **"Reopen in Container"**

### 2. Aguardar Inicialização

- Primeira vez: ~3-5 minutos (build + npm install)
- Próximas vezes: ~30 segundos

### 3. Desenvolver

O ambiente já está pronto com:

- ✅ Node.js 20
- ✅ TypeScript
- ✅ Todas as dependências instaladas
- ✅ Extensões configuradas
- ✅ ESLint e Prettier ativos

## 🐛 Debugar a Aplicação

### Opção 1: Debug Completo

Pressione `F5` ou selecione **"Debug Electron (All)"** no painel Debug

### Opção 2: Apenas Main Process

Selecione **"Debug Main Process"** e pressione `F5`

### Opção 3: Apenas Renderer

Selecione **"Debug Renderer Process"** e pressione `F5`

## ⚡ Executar Comandos

```bash
# Dev server (Vite)
npm run dev

# Electron com hot reload
npm run electron:dev

# Build de produção
npm run build

# Lint
npm run lint
```

## 🔄 Reconstruir Container

Se modificar `.devcontainer/devcontainer.json`:

```bash
F1 → Dev Containers: Rebuild Container
```

## 📍 Acessar a Aplicação

- Vite Dev Server: `http://localhost:5173`
- Porta automaticamente encaminhada do container

## ❓ Problemas Comuns

**Container não inicia:**

- Verifique se o Docker Desktop está rodando
- Aumente recursos do Docker (mínimo 4GB RAM)

**TypeScript com erros:**

```bash
F1 → TypeScript: Restart TS Server
```

**Porta 5173 em uso:**

- Pare outros processos usando essa porta
- Ou altere a porta em `vite.config.ts`

## 💡 Dica

O ambiente usa volumes do Docker para `node_modules`, garantindo performance máxima mesmo em sistemas remotos.
