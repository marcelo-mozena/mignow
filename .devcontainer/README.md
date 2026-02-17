# Remote Development Environment Setup

This project includes a complete VS Code Dev Container configuration for lightweight and efficient remote development.

## 🚀 Quick Start

### Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Remote - Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Getting Started

1. **Open in Container**
   - Open this project in VS Code
   - Press `F1` and select `Dev Containers: Reopen in Container`
   - Wait for the container to build and initialize (first time only)

2. **Alternative: Clone in Container**
   ```bash
   # Press F1 → Dev Containers: Clone Repository in Container Volume
   # Enter: https://github.com/marcelo-mozena/template-electron
   ```

## 🛠️ What's Included

### Development Tools

- **Node.js 20** (LTS)
- **TypeScript** with full IntelliSense
- **Git** and **GitHub CLI**
- **ESLint** for code quality
- **Prettier** for code formatting
- **Tailwind CSS IntelliSense**

### VS Code Extensions (Auto-installed)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Enhanced
- Auto Rename Tag
- Path Intellisense
- Error Lens
- ES7+ React/Redux Snippets

### Debugging Configurations

#### 1. Debug Main Process

Debug the Electron main process (Node.js)

- Press `F5` or use Run → Start Debugging
- Breakpoints work in `electron/main.ts`

#### 2. Debug Renderer Process

Debug the Electron renderer (React app in Electron window)

- Select "Debug Renderer Process" from debug dropdown
- Breakpoints work in React components

#### 3. Debug Vite Dev Server

Debug the React app in a regular browser

- Select "Debug Vite Dev Server"
- Opens Chrome DevTools for the Vite server

#### 4. Debug Electron (All)

Debug both main and renderer processes simultaneously

- Compound configuration for full debugging

## 📝 Available Tasks

Access tasks via `Terminal → Run Task` or `Ctrl/Cmd + Shift + B`:

- **npm: dev** - Start Vite dev server
- **npm: electron:dev** - Run Electron with hot reload
- **npm: build** - Build for production
- **npm: lint** - Run ESLint

## 🔧 Configuration Files

### Dev Container

- [.devcontainer/devcontainer.json](.devcontainer/devcontainer.json) - Container configuration
  - Uses lightweight Node 20 image
  - Auto-installs dependencies
  - Mounts node_modules as volume for performance

### VS Code

- [.vscode/launch.json](.vscode/launch.json) - Debugging configurations
- [.vscode/tasks.json](.vscode/tasks.json) - Build and run tasks
- [.vscode/settings.json](.vscode/settings.json) - Workspace settings
- [.vscode/extensions.json](.vscode/extensions.json) - Recommended extensions

### Code Quality

- [.prettierrc](.prettierrc) - Prettier configuration
- [.prettierignore](.prettierignore) - Prettier ignore rules

## 🎯 Features

### Automatic Formatting

- **Format on Save**: Enabled by default
- **ESLint Auto-fix**: Fixes issues on save
- **Prettier Integration**: Consistent code style

### Port Forwarding

- **Port 5173**: Vite dev server (auto-forwarded)
- Access from host: `http://localhost:5173`

### Performance Optimizations

- Node modules mounted as named volume (faster I/O)
- Excluded folders from search/file watcher
- Optimized TypeScript settings

## 🏗️ Architecture Support

This setup fully supports the project's Clean Architecture with CQRS:

### Domain Layer

- Full IntelliSense for entities and value objects
- Type checking for domain interfaces

### Application Layer

- Debugging for commands and queries
- Event bus monitoring

### Infrastructure Layer

- Electron IPC debugging
- Repository pattern support

### Presentation Layer

- React component debugging
- React Query dev tools support
- Hot module replacement

## 📦 Workspace Structure Awareness

The dev environment is configured to work with:

- **TypeScript** strict mode
- **Dependency Injection** (Inversify)
- **CQRS Pattern** with commands/queries
- **Event-driven Architecture**
- **Clean Architecture** layers
- **Tailwind CSS** with shadcn/ui

## 🐛 Debugging Tips

### Main Process Debugging

1. Set breakpoints in `electron/main.ts`
2. Press `F5` to start debugging
3. Check Variables and Call Stack panels

### Renderer Process Debugging

1. Set breakpoints in React components
2. Use "Debug Renderer Process" configuration
3. Use Chrome DevTools features

### IPC Communication Debugging

1. Set breakpoints in `electron/ipc/` files
2. Use console.log in both processes
3. Check Electron DevTools Console

## 🔄 Reloading the Container

If you modify `.devcontainer/devcontainer.json`:

1. Press `F1`
2. Select `Dev Containers: Rebuild Container`

## 🌐 Remote Development Options

This setup supports:

- **Local Container**: Run on your machine
- **Remote SSH**: Connect to remote server with Docker
- **GitHub Codespaces**: Cloud-based development
- **WSL 2**: Windows Subsystem for Linux

## 💡 Tips

- Use `Ctrl/Cmd + P` for quick file navigation
- Use `Ctrl/Cmd + Shift + P` for command palette
- Use `Ctrl/Cmd + B` to toggle sidebar
- Use `Ctrl/Cmd + J` to toggle terminal
- Use `F12` to go to definition
- Use `Shift + F12` to find all references

## 🆘 Troubleshooting

### Container won't start

- Ensure Docker Desktop is running
- Check Docker has enough resources (4GB+ RAM recommended)
- Rebuild container: `F1 → Dev Containers: Rebuild Container`

### TypeScript errors

- Restart TS Server: `F1 → TypeScript: Restart TS Server`
- Ensure using workspace TypeScript: `F1 → TypeScript: Select TypeScript Version → Use Workspace Version`

### Port already in use

- Stop other processes using port 5173
- Change port in `vite.config.ts`

### Slow performance

- Increase Docker Desktop resources
- Use named volumes for node_modules (already configured)
- Exclude more folders in settings

## 📚 Additional Resources

- [VS Code Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Electron Debugging Guide](https://www.electronjs.org/docs/latest/tutorial/debugging-vscode)
- [React DevTools](https://react.dev/learn/react-developer-tools)
