<!-- markdownlint-disable-file -->
# 🎯 PLANO DE AÇÃO - ARJSYS FRONTEND

**Projeto:** Sistema ERP ArjSys  
**Stack Base:** React 19 + TypeScript + Vite 7 + TanStack Router + Zustand + Tailwind 4.1 + shadcn/ui  
**Status Atual:** Ambiente base configurado (6 commits realizados)

---

## ✅ SETUP BASE CONCLUÍDO

- [x] Commit 1: Setup base + workspace pnpm
- [x] Commit 2: TypeScript com aliases
- [x] Commit 3: Tailwind CSS 4.1
- [x] Commit 4: TanStack Router
- [x] Commit 5: Zustand
- [x] Commit 6: shadcn/ui

---

## 📋 FASES DE DESENVOLVIMENTO

---

## **FASE 1: ESTRUTURA VISUAL** 🏗️

### Objetivo:
Criar estrutura visual do layout sem lógica complexa.

### Subetapas:

#### 1.1 - WorkspaceLayout Base
- [x] Criar `src/layouts/WorkspaceLayout.tsx`
- [x] Estrutura flex: Header + Sidebar + MainContent
- [x] Grid CSS para posicionamento
- [x] Integrar no TanStack Router (`/app`)

#### 1.2 - Header Visual
- [x] Criar `src/layouts/Header.tsx`
- [x] Logo + Título (esquerda)
- [x] Espaço para search (centro)
- [x] Botões placeholder (direita)
- [x] Altura fixa 64px

#### 1.3 - Sidebar Visual
- [x] Criar `src/layouts/Sidebar.tsx`
- [x] Container fixo 240px
- [x] CATEGORIES const hardcoded
- [x] Menu placeholder (sem funcionalidade)
- [x] Estilos básicos

#### 1.4 - MainContent Container
- [x] Criar `src/layouts/MainContent.tsx`
- [x] Container flex column
- [x] Área para TabsBar (placeholder)
- [x] Área para WorkspaceContent (placeholder)

#### 1.5 - Rota App
- [x] Criar `src/routes/app.tsx`
- [x] Usar WorkspaceLayout
- [x] Configurar redirecionamento de `/` para `/app`

**Tempo Estimado:** 1 hora  
**Commit:** "FEATURE: Layout base (Header + Sidebar + WorkspaceLayout)"

---

## **FASE 2: LÓGICA E ESTADO** 🐻

### Objetivo:
Criar stores Zustand e estrutura de tipos/registries.

### Subetapas:

#### 2.1 - Types TypeScript
- [x] Criar `src/types/tab.types.ts`
  - [x] Interface `Tab` (id, type, title, icon, entityId, isDirty)
  - [x] Union type `TabType`
  - [x] Interface `TabMetadata`

- [x] Criar `src/types/registry.types.ts`
  - [x] Interface `TabConfig`
  - [x] Interface `TabRegistry`

#### 2.2 - Stores Base
- [x] Criar `src/stores/tabsStore.ts`
  - [x] Estado: tabs[], activeTabId, closedHistory
  - [x] Funções: openTab, closeTab, setActiveTab, reopenLastTab

- [x] Criar `src/stores/sidebarStore.ts`
  - [x] Estado: mode (normal/compact/closed), isPinned
  - [x] Funções: toggleMode, setMode, togglePin

- [x] Criar `src/stores/rightSidebarStore.ts`
  - [x] Estado: openSidebar (null | 'settings' | 'notifications' | 'sessions' | 'stats')
  - [x] Funções: open(type), close, toggle

- [x] Criar `src/stores/themeStore.ts`
  - [x] Estado: theme (default/emerald/orange/purple), darkMode
  - [x] Funções: setTheme, toggleDarkMode, applyDarkMode
  - [x] Persistência com zustand/middleware

- [x] Criar `src/stores/index.ts` (exports)

#### 2.3 - Registry Pattern Base
- [x] Criar `src/registries/cadastrosRegistry.ts` (vazio)
- [x] Criar `src/registries/vendasRegistry.ts` (vazio)
- [x] Criar `src/registries/producaoRegistry.ts` (vazio)
- [x] Criar `src/registries/comprasRegistry.ts` (vazio)
- [x] Criar `src/registries/engenhariaRegistry.ts` (vazio)
- [x] Criar `src/registries/modelsRegistry.ts` (páginas modelo)
- [x] Criar `src/registries/index.ts`
  - [x] Função `getTabConfig(type: TabType)`
  - [x] Função `getTabsByCategory(category: string)`
  - [x] Função `getAllCategories()`

**Tempo Estimado:** 1h 30min  
**Commits:**
- "CONFIG: Types TypeScript para sistema de abas"
- "FEATURE: Stores Zustand (tabs, sidebar, rightSidebar, theme)"
- "CONFIG: Registry Pattern base com 6 registries"

---

## **FASE 3: INTEGRAÇÃO FUNCIONAL** ⚡

### Objetivo:
Conectar layout com stores e implementar sistema de abas.

### Subetapas:

#### 3.1 - Sidebar Funcional
- [x] Atualizar `src/layouts/Sidebar.tsx`
- [x] Integrar com `tabsStore` (openTab ao clicar)
- [x] Buscar itens do Registry via `getTabsByCategory()`
- [x] Accordion para grupos (shadcn accordion instalado)

#### 3.2 - Sistema de Abas
- [x] Criar `src/components/workspace/TabsBar.tsx`
  - [x] Renderizar lista de abas (tabs[])
  - [x] Destacar aba ativa
  - [x] Botão close em cada aba
  - [x] Click ativa aba

- [x] Criar `src/components/workspace/WorkspaceContent.tsx`
  - [x] Buscar config da aba ativa no Registry
  - [x] Renderizar componente dinamicamente
  - [x] Placeholder para não implementado

- [x] Criar `src/components/workspace/TabContainer.tsx`
  - [x] Wrapper para páginas
  - [x] Prover contexto (tabId, entityId)

- [x] Criar `src/components/workspace/EmptyWorkspace.tsx`
  - [x] Exibir quando nenhuma aba aberta

- [x] Criar `src/components/workspace/TabUnderConstruction.tsx`
  - [x] Placeholder para páginas não implementadas

#### 3.3 - Integrar MainContent
- [x] Atualizar `src/layouts/MainContent.tsx`
- [x] Incluir `<TabsBar />`
- [x] Incluir `<WorkspaceContent />`

#### 3.4 - Modal de Confirmação
- [x] Instalar shadcn: `pnpm dlx shadcn@latest add dialog alert-dialog`
- [x] Criar modal "Fechar aba com alterações?"
- [x] Integrar com tabsStore.closeTab()

**Tempo Estimado:** 2h 30min  
**Commits:**
- "FEATURE: Sidebar funcional com navegação e Registry"
- "FEATURE: Sistema de abas (TabsBar + WorkspaceContent)"

---

## **FASE 4: COMPLEMENTOS** ✨

### Objetivo:
Header funcional, RightSidebar e Command Palette.

### Subetapas:

#### 4.1 - Header Funcional
- [x] Instalar shadcn: `pnpm dlx shadcn@latest add dropdown-menu avatar badge popover`
- [x] Atualizar `src/layouts/Header.tsx`
  - [x] Logo clicável (vai para /app)
  - [x] Search bar (trigger Command Palette - placeholder)
  - [x] Botões: Settings, Notifications, Sessions, Stats
  - [x] User menu dropdown (perfil, logout)
  - [x] Theme switcher (dark mode toggle)

#### 4.2 - RightSidebar Base
- [ ] Instalar shadcn: `pnpm dlx shadcn@latest add sheet`
- [ ] Criar `src/layouts/RightSidebar.tsx`
  - [ ] Container sliding da direita
  - [ ] Backdrop com click-outside
  - [ ] Props: isOpen, onClose, title, width

#### 4.3 - Conteúdos RightSidebar
- [ ] Criar `src/components/sidebars/SettingsContent.tsx`
  - [ ] Theme picker
  - [ ] Opções de sidebar

- [ ] Criar `src/components/sidebars/NotificationsContent.tsx`
  - [ ] Lista de notificações (mock)
  - [ ] Badges de contagem

- [ ] Criar `src/components/sidebars/SessionsContent.tsx`
  - [ ] Lista de sessões ativas
  - [ ] Botão logout

- [ ] Criar `src/components/sidebars/StatsContent.tsx`
  - [ ] Estatísticas de uso
  - [ ] Abas abertas, tempo de sessão

#### 4.4 - Command Palette
- [ ] Instalar shadcn: `pnpm dlx shadcn@latest add command`
- [ ] Criar `src/components/ui/CommandPalette.tsx`
  - [ ] Busca global de páginas
  - [ ] Keyboard navigation
  - [ ] Integrar com Registry
  - [ ] Atalho Ctrl+K

- [ ] Criar `src/hooks/useKeyboardShortcuts.ts`
  - [ ] Hook para atalhos globais
  - [ ] Ctrl+K → Command Palette
  - [ ] Ctrl+Shift+T → Reabrir última aba

#### 4.5 - Integrar no WorkspaceLayout
- [ ] Adicionar RightSidebar (4 instâncias)
- [ ] Adicionar CommandPalette
- [ ] Conectar com rightSidebarStore

#### 4.6 - Sidebar Avançada (Opcional)
- [ ] Integrar com `sidebarStore` (mode, toggleMode)
- [ ] Implementar modo compact (64px - só ícones)
- [ ] Instalar shadcn: `pnpm dlx shadcn@latest add tooltip`
- [ ] Tooltips no modo compact
- [ ] Botão toggle entre modos

**Tempo Estimado:** 2 horas  
**Commits:**
- "FEATURE: Header funcional completo"
- "FEATURE: RightSidebar com 4 conteúdos"
- "FEATURE: Command Palette (Ctrl+K)"

---

## **FASE 5: PÁGINAS MODELO** 📄

### Objetivo:
Criar 3 páginas modelo + NotFound para servir de template.

### Subetapas:

#### 5.1 - Componentes Reutilizáveis
- [ ] Instalar shadcn: `pnpm dlx shadcn@latest add breadcrumb`
- [ ] Criar `src/components/shared/PageHeader.tsx`
  - [ ] Título + descrição
  - [ ] Breadcrumbs
  - [ ] Slot para botões de ação

- [ ] Criar `src/components/shared/PageWrapper.tsx`
  - [ ] Wrapper padrão para páginas
  - [ ] Padding consistente
  - [ ] Scroll isolado

#### 5.2 - NotFound Page
- [ ] Criar `src/pages/auth/NotFoundPage.tsx`
  - [ ] Erro 404 estilizado
  - [ ] Botão voltar para workspace
  - [ ] Registrar no TanStack Router

#### 5.3 - Página Modelo A (Lista Simples)
- [ ] Criar `src/pages/models/ModeloListaPage.tsx`
  - [ ] PageHeader com título
  - [ ] Lista de items (mock data)
  - [ ] Scroll vertical
  - [ ] Botão de ação (adicionar)

- [ ] Registrar em `src/registries/modelsRegistry.ts`
  - [ ] type: 'modelo-lista'
  - [ ] defaultTitle: 'Modelo: Lista Simples'

#### 5.4 - Página Modelo B (Formulário)
- [ ] Instalar shadcn: `pnpm dlx shadcn@latest add form label textarea select`
- [ ] Criar `src/pages/models/ModeloFormPage.tsx`
  - [ ] PageHeader
  - [ ] Formulário completo (vários campos)
  - [ ] Botão abrir RightSidebar (settings)
  - [ ] Validação básica

- [ ] Registrar em `modelsRegistry.ts`
  - [ ] type: 'modelo-form'
  - [ ] defaultTitle: 'Modelo: Formulário'

#### 5.5 - Página Modelo C (Complexa)
- [ ] Instalar shadcn: `pnpm dlx shadcn@latest add tabs table`
- [ ] Criar `src/pages/models/ModeloComplexoPage.tsx`
  - [ ] PageHeader
  - [ ] Tabs internas (shadcn)
  - [ ] Tabela de dados
  - [ ] Gráfico simples
  - [ ] Múltiplas seções

- [ ] Registrar em `modelsRegistry.ts`
  - [ ] type: 'modelo-complexo'
  - [ ] defaultTitle: 'Modelo: Página Complexa'

#### 5.6 - Testar Fluxo Completo
- [ ] Abrir cada página modelo pelo Sidebar
- [ ] Testar múltiplas instâncias
- [ ] Testar close/reopen
- [ ] Testar responsividade
- [ ] Testar RightSidebar
- [ ] Testar Command Palette

**Tempo Estimado:** 2h 30min  
**Commits:**
- "FEATURE: Componentes reutilizáveis (PageHeader, PageWrapper)"
- "FEATURE: NotFoundPage (404)"
- "FEATURE: 3 páginas modelo completas (lista, form, complexo)"

---

## **FASE 6: AUTENTICAÇÃO** 🔐

### Objetivo:
Sistema de login e proteção de rotas.

### Subetapas:

#### 6.1 - Auth Store
- [ ] Criar `src/types/auth.types.ts`
  - [ ] Interface `User`
  - [ ] Interface `AuthState`

- [ ] Criar `src/stores/authStore.ts`
  - [ ] Estado: user, token, isAuthenticated
  - [ ] Funções: login, logout, checkAuth
  - [ ] Persistência em localStorage

#### 6.2 - Login Page
- [ ] Criar `src/layouts/AuthLayout.tsx`
  - [ ] Layout simples para auth
  - [ ] Background estilizado

- [ ] Criar `src/pages/auth/LoginPage.tsx`
  - [ ] Formulário de login
  - [ ] Logo ArjSys
  - [ ] Validação básica
  - [ ] Redirect para /app após login

- [ ] Criar rota `src/routes/login.tsx`

#### 6.3 - Proteção de Rotas
- [ ] Atualizar `src/routes/__root.tsx`
  - [ ] Verificar autenticação
  - [ ] Redirect para /login se não autenticado

- [ ] Atualizar `src/routes/app.tsx`
  - [ ] Proteger com authStore
  - [ ] Redirect para /login se necessário

#### 6.4 - Logout
- [ ] Integrar logout no Header (user menu)
- [ ] Limpar stores ao fazer logout
- [ ] Redirect para /login

**Tempo Estimado:** 1h 30min  
**Commits:**
- "FEATURE: Auth store e types"
- "FEATURE: Login page e proteção de rotas"
- "FEATURE: Logout e limpeza de sessão"

---

## 📊 RESUMO DO PLANO

| Fase | Foco | Tempo | Arquivos | Commits |
|------|------|-------|----------|---------|
| 1 | Layout Visual | 1h | 5 arquivos | 1 |
| 2 | Stores + Types | 1h30 | 12 arquivos | 3 |
| 3 | Sistema Abas | 2h30 | 7 arquivos | 2 |
| 4 | Complementos | 2h | 8 arquivos | 3 |
| 5 | Páginas Modelo | 2h30 | 7 arquivos | 3 |
| 6 | Autenticação | 1h30 | 5 arquivos | 3 |
| **TOTAL** | | **11h30** | **~44 arquivos** | **15 commits** |

---

## ✅ CRITÉRIOS DE CONCLUSÃO

### Fase 1 Concluída:
- [x] Layout renderiza sem erros
- [x] Header, Sidebar e MainContent visíveis
- [x] Rota /app funciona

### Fase 2 Concluída:
- [ ] Todos os stores criados
- [ ] Types compilam sem erros
- [ ] Registries exportam corretamente

### Fase 3 Concluída:
- [ ] Click no menu abre aba
- [ ] Múltiplas abas funcionam
- [ ] Close tab funciona
- [ ] Sidebar collapse funciona

### Fase 4 Concluída:
- [ ] Header totalmente funcional
- [ ] RightSidebar abre/fecha
- [ ] Command Palette funciona (Ctrl+K)
- [ ] Todos os atalhos funcionam

### Fase 5 Concluída:
- [ ] 3 páginas modelo funcionam 100%
- [ ] NotFound funciona
- [ ] Todas as funcionalidades testadas
- [ ] Sistema = template completo

### Fase 6 Concluída:
- [ ] Login/logout funciona
- [ ] Proteção de rotas funciona
- [ ] Persistência de sessão funciona
- [ ] Sistema 100% pronto para desenvolvimento

---

## 🎯 APÓS CONCLUSÃO

**Sistema estará:**
- ✅ 100% funcional
- ✅ Multi-tab operacional
- ✅ Registry Pattern implementado
- ✅ 3 páginas modelo como template
- ✅ Autenticação funcionando
- ✅ Pronto para criar páginas reais

**Próximos passos:**
- Implementar CRUDs reais (Clientes, Produtos, Fornecedores)
- Implementar funcionalidades específicas (BOM, Pedidos, Ordens)
- Integração com backend .NET

---

**Data Início:** [preencher]  
**Data Conclusão Prevista:** [preencher]  
**Status Atual:** Setup base concluído (6 commits)
