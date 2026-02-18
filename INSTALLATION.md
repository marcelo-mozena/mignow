# Manual de Instalação — SSP Migration Wizard (Electron)

Este documento descreve como configurar o ambiente de desenvolvimento e gerar pacotes distribuíveis para **macOS**, **Windows** e **Linux**.

---

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Configuração de Desenvolvimento (Todas as Plataformas)](#2-configuração-de-desenvolvimento-todas-as-plataformas)
3. [macOS](#3-macos)
4. [Windows](#4-windows)
5. [Linux](#5-linux)
6. [Notas de Compatibilidade Multiplataforma](#6-notas-de-compatibilidade-multiplataforma)
7. [Solução de Problemas](#7-solução-de-problemas)

---

## 1. Pré-requisitos

| Ferramenta | Versão | Finalidade                                                   |
| ---------- | ------ | ------------------------------------------------------------ |
| Node.js    | ≥ 18.x | Runtime e gerenciador de pacotes                             |
| npm        | ≥ 9.x  | Gerenciamento de dependências                                |
| Git        | ≥ 2.x  | Controle de versão                                           |
| Python     | 3.x    | Necessário para alguns módulos nativos durante `npm install` |

> **Nota:** O `electron-builder` pode exigir ferramentas de build adicionais dependendo do sistema operacional (veja as seções específicas de cada plataforma).

---

## 2. Configuração de Desenvolvimento (Todas as Plataformas)

```bash
# 1. Clonar o repositório
git clone https://github.com/marcelo-mozena/mignow.git
cd mignow

# 2. Instalar dependências
npm install

# 3. Executar em modo web (sem Electron)
npm run dev

# 4. Executar em modo Electron (abre uma janela nativa)
npm run electron:dev
```

| Script                   | Descrição                                                                 |
| ------------------------ | ------------------------------------------------------------------------- |
| `npm run dev`            | Inicia o servidor de desenvolvimento Next.js (web, http://localhost:3000) |
| `npm run electron:dev`   | Inicia Next.js + Electron simultaneamente                                 |
| `npm run build`          | Gera o export estático do Next.js + distribuível do Electron              |
| `npm run electron:build` | Mesmo que `build`                                                         |

---

## 3. macOS

### 3.1 Pré-requisitos Adicionais

- **Xcode Command Line Tools** (para compilação de módulos nativos):
  ```bash
  xcode-select --install
  ```

### 3.2 Desenvolvimento

```bash
npm install
npm run electron:dev
```

### 3.3 Build para Distribuição

```bash
npm run electron:build
```

**Artefatos gerados** (em `dist-electron/`):

| Arquivo                            | Tipo                               |
| ---------------------------------- | ---------------------------------- |
| `Electron React App-x.x.x.dmg`     | Imagem de disco macOS (instalador) |
| `Electron React App-x.x.x-mac.zip` | Arquivo zip portátil               |

### 3.4 Instalando o .dmg

1. Clique duas vezes no arquivo `.dmg`.
2. Arraste o ícone do aplicativo para a pasta **Aplicativos**.
3. Na primeira execução, clique com o botão direito → **Abrir** para ignorar o Gatekeeper (app não assinado).

### 3.5 Assinatura de Código (Opcional — para distribuição)

Para evitar avisos do Gatekeeper, configure a assinatura de código no `package.json`:

```json
"mac": {
  "identity": "Developer ID Application: Seu Nome (TEAM_ID)",
  "hardenedRuntime": true,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist"
}
```

Defina as variáveis de ambiente antes do build:

```bash
export CSC_LINK=caminho/para/certificado.p12
export CSC_KEY_PASSWORD=sua-senha
npm run electron:build
```

---

## 4. Windows

### 4.1 Pré-requisitos Adicionais

- **Visual Studio Build Tools** (para módulos nativos do Node):

  ```powershell
  # Opção A — via npm (recomendado)
  npm install --global windows-build-tools

  # Opção B — instalação manual
  # Baixe de https://visualstudio.microsoft.com/visual-cpp-build-tools/
  # Selecione "Desenvolvimento para desktop com C++"
  ```

- **Git for Windows** (https://git-scm.com/download/win)

### 4.2 Desenvolvimento

```powershell
npm install
npm run electron:dev
```

### 4.3 Build para Distribuição

```powershell
npm run electron:build
```

**Artefatos gerados** (em `dist-electron/`):

| Arquivo                              | Tipo                |
| ------------------------------------ | ------------------- |
| `Electron React App Setup x.x.x.exe` | Instalador NSIS     |
| `Electron React App x.x.x.exe`       | Executável portátil |

### 4.4 Instalando o .exe (NSIS)

1. Clique duas vezes no `.exe` de Setup.
2. Escolha o diretório de instalação (pode ser alterado no assistente).
3. Conclua o assistente — atalho na área de trabalho e entrada no Menu Iniciar são criados automaticamente.
4. O Windows Defender SmartScreen pode exibir um aviso para apps não assinados — clique em **Mais informações** → **Executar assim mesmo**.

### 4.5 Assinatura de Código (Opcional — para distribuição)

```json
"win": {
  "certificateFile": "caminho/para/certificado.pfx",
  "certificatePassword": "sua-senha"
}
```

Ou use variáveis de ambiente:

```powershell
$env:CSC_LINK = "caminho/para/certificado.pfx"
$env:CSC_KEY_PASSWORD = "sua-senha"
npm run electron:build
```

---

## 5. Linux

### 5.1 Pré-requisitos Adicionais

**Debian/Ubuntu:**

```bash
sudo apt update
sudo apt install -y build-essential libgtk-3-dev libnotify-dev \
  libnss3 libxss1 libxtst6 libatspi2.0-0 libsecret-1-dev \
  rpm fakeroot dpkg
```

**Fedora/RHEL:**

```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install gtk3-devel libnotify-devel nss libXScrnSaver \
  libXtst at-spi2-core libsecret-devel rpm-build
```

**Arch Linux:**

```bash
sudo pacman -S base-devel gtk3 libnotify nss libxss libxtst \
  at-spi2-core libsecret
```

### 5.2 Desenvolvimento

```bash
npm install
npm run electron:dev
```

### 5.3 Build para Distribuição

```bash
npm run electron:build
```

**Artefatos gerados** (em `dist-electron/`):

| Arquivo                              | Tipo                 |
| ------------------------------------ | -------------------- |
| `Electron React App-x.x.x.AppImage`  | Executável portátil  |
| `electron-react-app_x.x.x_amd64.deb` | Pacote Debian/Ubuntu |

### 5.4 Instalação

**AppImage (qualquer distro):**

```bash
chmod +x "Electron React App-x.x.x.AppImage"
./"Electron React App-x.x.x.AppImage"
```

**Debian/Ubuntu (.deb):**

```bash
sudo dpkg -i electron-react-app_x.x.x_amd64.deb
# Corrigir dependências faltantes, se necessário:
sudo apt --fix-broken install
```

### 5.5 Nota sobre Sandbox

Se o app falhar ao iniciar com erro de sandbox:

```bash
# Opção A — executar com a flag --no-sandbox
./app --no-sandbox

# Opção B — definir parâmetro do kernel (persistente)
echo 'kernel.unprivileged_userns_clone=1' | sudo tee /etc/sysctl.d/00-local-userns.conf
sudo sysctl --system
```

---

## 6. Notas de Compatibilidade Multiplataforma

### O que Funciona Nativamente

| Funcionalidade                          | macOS | Windows | Linux | Observações                          |
| --------------------------------------- | :---: | :-----: | :---: | ------------------------------------ |
| Processo principal do Electron          |  ✅   |   ✅    |  ✅   | Sem código específico de plataforma  |
| IPC (commands/queries)                  |  ✅   |   ✅    |  ✅   | Baseado em canais, agnóstico ao SO   |
| Isolamento de contexto + preload        |  ✅   |   ✅    |  ✅   | Boa prática de segurança             |
| Sistema de arquivos (salvar `.env.ssp`) |  ✅   |   ✅    |  ✅   | Usa `app.getPath('userData')`        |
| Export estático do Next.js              |  ✅   |   ✅    |  ✅   | `output: 'export'` no next.config.js |
| Cliente API (requisições web)           |  ✅   |   ✅    |  ✅   | API padrão `fetch`                   |
| Importação CSV/JSON                     |  ✅   |   ✅    |  ✅   | Parsing em JS puro                   |

### Comportamentos Específicos por Plataforma

| Comportamento                       | macOS                                 | Windows                | Linux             |
| ----------------------------------- | ------------------------------------- | ---------------------- | ----------------- |
| App encerra ao fechar última janela | Não (permanece no Dock)               | Sim                    | Sim               |
| `app.getPath('userData')`           | `~/Library/Application Support/<app>` | `%APPDATA%/<app>`      | `~/.config/<app>` |
| Notificações nativas                | Central de Notificações               | Central de Ações       | libnotify         |
| Decoração da janela                 | Semáforo (traffic lights)             | Barra de título padrão | Tema do sistema   |

### Checklist de Compatibilidade do Código-Fonte

- ✅ Todos os caminhos de arquivo usam `path.join()` (sem separadores hardcoded)
- ✅ Verificação `process.platform` para comportamento do Dock no macOS em `main.ts`
- ✅ `app.getPath('userData')` para diretório de dados portátil do usuário
- ✅ `contextIsolation: true` + `nodeIntegration: false` (padrões seguros)
- ✅ Sem addons nativos do Node.js (dependências em JS puro)
- ✅ Whitelist de canais IPC no script preload

---

## 7. Solução de Problemas

### Todas as Plataformas

| Problema                                  | Solução                                                                 |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `npm install` falha com erros do node-gyp | Instale as ferramentas de build da plataforma (seções 3.1, 4.1, 5.1)    |
| Janela do Electron fica em branco         | Verifique se o servidor Next.js está rodando na porta 3000              |
| `electron:dev` expira (timeout)           | Aumente o timeout do `wait-on` ou verifique se a porta 3000 está em uso |
| Build gera artefatos vazios               | Execute `npm run dev` primeiro para garantir que `dist/` foi gerado     |

### macOS

| Problema                       | Solução                                            |
| ------------------------------ | -------------------------------------------------- |
| "App está danificado" ao abrir | `xattr -cr /Applications/Electron\ React\ App.app` |
| Gatekeeper bloqueia a execução | Clique com botão direito → Abrir → confirmar       |

### Windows

| Problema                          | Solução                                                                    |
| --------------------------------- | -------------------------------------------------------------------------- |
| SmartScreen bloqueia o instalador | Clique em "Mais informações" → "Executar assim mesmo"                      |
| `ENOENT` durante o build          | Ative suporte a caminhos longos: `git config --system core.longpaths true` |
| Módulos nativos do Node.js falham | Instale o Visual Studio Build Tools com o workload de C++                  |

### Linux

| Problema                            | Solução                                                       |
| ----------------------------------- | ------------------------------------------------------------- |
| Erro de sandbox ao iniciar          | Execute com `--no-sandbox` ou habilite user namespaces        |
| Bibliotecas compartilhadas faltando | Instale `libgtk-3-0`, `libnss3`, `libxss1`                    |
| AppImage não executa                | Execute `chmod +x` no arquivo primeiro                        |
| Ícone da bandeja não aparece        | Instale uma extensão de bandeja do sistema (GNOME Shell etc.) |

---

## Resumo da Matriz de Build

```
npm run electron:build
├── macOS   → .dmg + .zip
├── Windows → NSIS .exe (instalador) + .exe portátil
└── Linux   → .AppImage + .deb
```

> **Compilação cruzada:** O `electron-builder` só consegue gerar pacotes para o SO host por padrão. Para compilar para todas as plataformas, use CI/CD (ex.: GitHub Actions com runners `macos-latest`, `windows-latest`, `ubuntu-latest`).
