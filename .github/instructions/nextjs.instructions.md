---
applyTo: "**"
---

# Melhores Práticas do Next.js

Este documento resume as melhores práticas mais recentes e autoritativas para construir, estruturar e manter aplicações Next.js. É destinado ao uso por LLMs e desenvolvedores para garantir qualidade de código, manutenibilidade e escalabilidade.

## 1. Estrutura e Organização do Projeto

- **Use o diretório `app/` (App Router)** para todos os novos projetos. Prefira-o ao diretório legado `pages/`.
- **Pastas de nível superior:**
  - `app/` — Roteamento, layouts, páginas e manipuladores de rota
  - `public/` — Ativos estáticos (imagens, fontes, etc.)
  - `lib/` — Utilitários compartilhados, clientes de API e lógica
  - `components/` — Componentes de UI reutilizáveis
  - `contexts/` — Provedores de contexto do React
  - `styles/` — Folhas de estilo globais e modulares
  - `hooks/` — Hooks personalizados do React
  - `types/` — Definições de tipos TypeScript
- **Colocação:** Coloque arquivos (componentes, estilos, testes) próximos de onde são usados, mas evite estruturas profundamente aninhadas.
- **Grupos de Rotas:** Use parênteses (ex.: `(admin)`) para agrupar rotas sem afetar o caminho da URL.
- **Pastas Privadas:** Prefixe com `_` (ex.: `_internal`) para optar por não rotear e sinalizar detalhes de implementação.

- **Pastas de Recursos:** Para apps grandes, agrupe por recurso (ex.: `app/dashboard/`, `app/auth/`).
- **Use `src/`** (opcional): Coloque todo o código fonte em `src/` para separar dos arquivos de configuração.

## 2.1. Integração de Server e Client Components (App Router)

**Nunca use `next/dynamic` com `{ ssr: false }` dentro de um Server Component.** Isso não é suportado e causará um erro de build/runtime.

**Abordagem Correta:**

- Se você precisar usar um Client Component (ex.: um componente que usa hooks, APIs do navegador ou bibliotecas apenas do cliente) dentro de um Server Component, você deve:
  1. Mover toda a lógica/UI apenas do cliente para um Client Component dedicado (com `'use client'` no topo).
  2. Importar e usar esse Client Component diretamente no Server Component (não há necessidade de `next/dynamic`).
  3. Se você precisar compor múltiplos elementos apenas do cliente (ex.: uma navbar com um dropdown de perfil), crie um único Client Component que contenha todos eles.

**Exemplo:**

```tsx
// Server Component
import DashboardNavbar from "@/components/DashboardNavbar";

export default async function DashboardPage() {
  // ...server logic...
  return (
    <>
      <DashboardNavbar /> {/* This is a Client Component */}
      {/* ...rest of server-rendered page... */}
    </>
  );
}
```

**Por que:**

- Server Components não podem usar recursos apenas do cliente ou importações dinâmicas com SSR desabilitado.
- Client Components podem ser renderizados dentro de Server Components, mas não o contrário.

**Resumo:**
Sempre mova UI apenas do cliente para um Client Component e importe-o diretamente no seu Server Component. Nunca use `next/dynamic` com `{ ssr: false }` em um Server Component.

---

## 2. Melhores Práticas de Componentes

- **Tipos de Componentes:**
  - **Server Components** (padrão): Para busca de dados, lógica pesada e UI não interativa.
  - **Client Components:** Adicione `'use client'` no topo. Use para interatividade, estado ou APIs do navegador.
- **Quando Criar um Componente:**
  - Se um padrão de UI é reutilizado mais de uma vez.
  - Se uma seção de uma página é complexa ou auto-contida.
  - Se melhora a legibilidade ou testabilidade.
- **Convenções de Nomenclatura:**
  - Use `PascalCase` para arquivos de componentes e exports (ex.: `UserCard.tsx`).
  - Use `camelCase` para hooks (ex.: `useUser.ts`).
  - Use `snake_case` ou `kebab-case` para ativos estáticos (ex.: `logo_dark.svg`).
  - Nomeie provedores de contexto como `XyzProvider` (ex.: `ThemeProvider`).
- **Nomenclatura de Arquivos:**
  - Combine o nome do componente com o nome do arquivo.
  - Para arquivos de exportação única, exporte o componente como padrão.
  - Para múltiplos componentes relacionados, use um arquivo `index.ts` barrel.
- **Localização de Componentes:**
  - Coloque componentes compartilhados em `components/`.
  - Coloque componentes específicos de rota dentro da pasta de rota relevante.
- **Props:**
  - Use interfaces TypeScript para props.
  - Prefira tipos de props explícitos e valores padrão.
- **Testes:**
  - Co-localize testes com componentes (ex.: `UserCard.test.tsx`).

## 3. Convenções de Nomenclatura (Geral)

- **Pastas:** `kebab-case` (ex.: `user-profile/`)
- **Arquivos:** `PascalCase` para componentes, `camelCase` para utilitários/hooks, `kebab-case` para ativos estáticos
- **Variáveis/Funções:** `camelCase`
- **Tipos/Interfaces:** `PascalCase`
- **Constantes:** `UPPER_SNAKE_CASE`

## 4. API Routes (Route Handlers)

- **Prefira API Routes sobre Edge Functions** a menos que você precise de latência ultra-baixa ou distribuição geográfica.
- **Localização:** Coloque API routes em `app/api/` (ex.: `app/api/users/route.ts`).
- **HTTP Methods:** Exporte funções assíncronas nomeadas após verbos HTTP (`GET`, `POST`, etc.).
- **Request/Response:** Use as APIs Web `Request` e `Response`. Use `NextRequest`/`NextResponse` para recursos avançados.
- **Dynamic Segments:** Use `[param]` para API routes dinâmicas (ex.: `app/api/users/[id]/route.ts`).
- **Validação:** Sempre valide e sanitize a entrada. Use bibliotecas como `zod` ou `yup`.
- **Tratamento de Erros:** Retorne códigos de status HTTP apropriados e mensagens de erro.
- **Autenticação:** Proteja rotas sensíveis usando middleware ou verificações de sessão do lado do servidor.

## 5. Melhores Práticas Gerais

- **TypeScript:** Use TypeScript para todo o código. Habilite o modo `strict` em `tsconfig.json`.
- **ESLint & Prettier:** Imponha estilo de código e linting. Use a configuração oficial do Next.js ESLint.
- **Variáveis de Ambiente:** Armazene segredos em `.env.local`. Nunca commite segredos no controle de versão.
- **Testes:** Use Jest, React Testing Library ou Playwright. Escreva testes para toda lógica crítica e componentes.
- **Acessibilidade:** Use HTML semântico e atributos ARIA. Teste com leitores de tela.
- **Performance:**
  - Use otimização integrada de Image e Font.
  - Use Suspense e estados de carregamento para dados assíncronos.
  - Evite bundles grandes do cliente; mantenha a maior parte da lógica em Server Components.
- **Segurança:**
  - Sanitize toda entrada do usuário.
  - Use HTTPS em produção.
  - Defina cabeçalhos HTTP seguros.
- **Documentação:**
  - Escreva README claro e comentários no código.
  - Documente APIs públicas e componentes.

# Evite Arquivos de Exemplo Desnecessários

Não crie arquivos de exemplo/demo (como ModalExample.tsx) no código principal a menos que o usuário solicite especificamente um exemplo ao vivo, uma história do Storybook ou um componente de documentação. Mantenha o repositório limpo e focado em produção por padrão.

# Sempre use a documentação e guias mais recentes

- Para cada solicitação relacionada ao Next.js, comece pesquisando a documentação, guias e exemplos mais atuais do Next.js.
- Use as seguintes ferramentas para buscar e pesquisar documentação, se disponíveis:
  - `resolve_library_id` para resolver o nome da biblioteca/pacote nos docs.
  - `get_library_docs` para documentação atualizada.
