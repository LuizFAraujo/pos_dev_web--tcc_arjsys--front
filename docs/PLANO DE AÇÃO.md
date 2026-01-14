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
- [x] Instalar shadcn: `pnpm dlx shadcn@latest add sheet`
- [x] Criar `src/layouts/RightSidebar.tsx`
  - [x] Container sliding da direita
  - [x] Backdrop com click-outside
  - [x] Props: type, title, children
  - [x] Largura responsiva (w-full sm:w-96)
- [x] Atualizar `src/layouts/WorkspaceLayout.tsx`
  - [x] Importar RightSidebar
  - [x] Renderizar 4 instâncias com placeholders

#### 4.3 - Conteúdos RightSidebar
- [x] Criar `src/components/sidebars/SettingsContent.tsx`
  - [x] Theme picker
  - [x] Opções de sidebar

- [x] Criar `src/components/sidebars/NotificationsContent.tsx`
  - [x] Lista de notificações (mock)
  - [x] Badges de contagem

- [x] Criar `src/components/sidebars/SessionsContent.tsx`
  - [x] Lista de sessões ativas
  - [x] Botão logout

- [x] Criar `src/components/sidebars/StatsContent.tsx`
  - [x] Estatísticas de uso
  - [x] Abas abertas, tempo de sessão

#### 4.4 - Command Palette
- [x] Instalar shadcn: `pnpm dlx shadcn@latest add command`
- [x] Criar `src/components/workspace/CommandPalette.tsx`
  - [x] Busca global de páginas
  - [x] Keyboard navigation
  - [x] Integrar com Registry
  - [x] Agrupamento por categoria
- [x] Criar `src/hooks/useKeyboardShortcuts.ts`
  - [x] Hook para atalhos globais
  - [x] Ctrl+K → Command Palette
  - [x] Ctrl+Shift+T → Reabrir última aba
- [x] Atualizar Header.tsx
  - [x] Callback onOpenCommandPalette
  - [x] Click na busca abre palette
- [x] Atualizar WorkspaceLayout.tsx
  - [x] Renderizar CommandPalette
  - [x] Registrar atalhos de teclado

#### 4.5 - Sidebar Avançada
- [x] Instalar shadcn: `pnpm dlx shadcn@latest add tooltip`
- [x] Atualizar sidebarStore:
  - [x] Modos: normal, compact, closed
  - [x] Pin: isPinned, togglePin
  - [x] Toggle principal: toggle()
  - [x] Persistência com zustand/middleware
- [x] Botão hambúrguer no Header (já existia)
- [x] Comportamento toggle baseado em pin:
  - [x] Pinado: normal ↔ compact (ícones)
  - [x] Não pinado: normal ↔ closed (oculto)
- [x] Modo compact:
  - [x] 64px com ícones
  - [x] Tooltips ao hover
  - [x] Sem header/subheader
- [x] Modo normal:
  - [x] 240px completo
  - [x] Subheader "Menu" com 3 botões:
    - [x] Pin (fixar/desafixar)
    - [x] ChevronsRight (collapse all - placeholder Fase 5.x)
    - [x] ChevronsDown (expand all - placeholder Fase 5.x)
  - [x] Sem header vazio extra
- [x] Modo closed:
  - [x] 0px completamente oculto
  - [x] Sem botões flutuantes
- [x] Transições suaves (300ms ease-in-out)
- [x] Estado persistido no localStorage

---

## **FASE 5: PÁGINAS MODELO** 📄

### Objetivo:
Criar 3 páginas modelo + NotFound para servir de template.

### Subetapas:

#### 5.1 - Componentes Reutilizáveis
- [x] Instalar shadcn: `pnpm dlx shadcn@latest add breadcrumb`
- [x] Criar `src/components/shared/PageHeader.tsx`
  - [x] Título + descrição
  - [x] Breadcrumbs
  - [x] Slot para botões de ação
- [x] Criar `src/components/shared/PageWrapper.tsx`
  - [x] Wrapper padrão para páginas
  - [x] Padding consistente
  - [x] Scroll isolado

#### 5.2 - NotFound Page
- [x] Criar `src/pages/auth/NotFoundPage.tsx`
  - [x] Erro 404 estilizado
  - [x] Botão voltar para workspace
  - [x] Registrar no TanStack Router

#### 5.3 - Página Modelo A (Lista Simples)
- [x] Criar `src/pages/models/ModeloListaPage.tsx`
  - [x] PageHeader com título
  - [x] Lista de items (mock data)
  - [x] Scroll vertical
  - [x] Botão de ação (adicionar)
- [x] Registrar em `src/registries/modelsRegistry.ts`
  - [x] type: 'modelo-lista'
  - [x] defaultTitle: 'Modelo: Lista Simples'

#### 5.4 - Página Modelo B (Formulário)
- [x] Instalar shadcn: `pnpm dlx shadcn@latest add form label input textarea select`
- [x] Criar `src/pages/models/ModeloFormPage.tsx`
  - [x] PageHeader
  - [x] Formulário completo (vários campos)
  - [x] Botão abrir RightSidebar (settings)
  - [x] Validação básica
- [x] Registrar em `modelsRegistry.ts`
  - [x] type: 'modelo-form'
  - [x] defaultTitle: 'Modelo: Formulário'

#### 5.5 - Página Modelo C (Complexa)
- [x] Instalar shadcn: `pnpm dlx shadcn@latest add tabs table`
- [x] Criar `src/pages/models/ModeloComplexoPage.tsx`
  - [x] PageHeader
  - [x] Tabs internas (shadcn)
  - [x] Tabela de dados
  - [x] Cards com estatísticas
  - [x] Múltiplas seções
- [x] Registrar em `modelsRegistry.ts`
  - [x] type: 'modelo-complexo'
  - [x] defaultTitle: 'Modelo: Página Complexa'

#### 5.6 - Testar Fluxo Completo
- [x] Adicionar categoria MODELOS na sidebar
- [x] Integrar modelsRegistry no index.ts
- [x] Abrir cada página modelo pelo Sidebar
- [x] Testar múltiplas instâncias
- [x] Testar close/reopen
- [x] Testar responsividade
- [x] Testar RightSidebar
- [x] Testar Command Palette

---

## **FASE 5.7: REFINAMENTOS E CORREÇÕES** 🔧

### Objetivo:
Corrigir problemas identificados e implementar features avançadas da sidebar.

### Subetapas:

#### 5.7.1 - Correções Críticas
- [x] Isolamento de estado entre abas
  - [x] Criar `src/hooks/useTabState.ts` (estado isolado por tabId via Map global)
  - [x] Criar `src/hooks/useTabForm.ts` (gerenciamento de formulários completos)
  - [x] Atualizar `WorkspaceContent.tsx` para passar prop `tab`
  - [x] Atualizar `ModeloFormPage.tsx` para receber prop `tab` e usar `useTabForm`
  - [x] Garantir instâncias totalmente independentes via key única
  - [x] Testar múltiplas abas da mesma página
  - [x] Validar preservação de dados ao trocar abas

- [x] Scroll isolado e condicional
  - [x] `tailwind.css`: adicionar `overflow-hidden` no body e #root
  - [x] `MainContent.tsx`: adicionar `min-w-0` crítico
  - [x] `WorkspaceContent.tsx`: único `overflow-y-auto` com `scrollbar-thin`
  - [x] `ModeloFormPage.tsx`: remover `overflow-y-auto` duplicado
  - [x] Testar scroll único sem navbar sumindo
  - [x] Validar scrollbar aparece apenas no conteúdo

- [x] Corrigir accordion duas setas
  - [x] `accordion.tsx`: trocar `ChevronDownIcon` por `ChevronRight`
  - [x] `accordion.tsx`: corrigir rotação de `-rotate-90` para `rotate-90`
  - [x] Validar rotação: → (fechado) ↓ (aberto)

#### 5.7.2 - Ajustes Visuais
- [ ] Reduzir altura PageHeader
  - [ ] Ajustar padding (py-4 → py-3)
  - [ ] Reduzir espaçamento breadcrumbs (mb-2 → mb-1)
  - [ ] Otimizar espaçamento título/descrição

- [ ] Reduzir altura TabsBar
  - [ ] Reduzir altura da aba (h-12 → h-10)
  - [ ] Ajustar padding interno
  - [ ] Ajustar tamanho de ícones

#### 5.7.3 - RightSidebar de Página
- [ ] Criar componente PageRightSidebar
  - [ ] Arquivo: `src/components/shared/PageRightSidebar.tsx`
  - [ ] Baseado em RightSidebar.tsx
  - [ ] Altura limitada à área da página
  - [ ] Mesmas funcionalidades (backdrop, ESC, click-outside)

- [ ] Criar store para RightSidebar de página
  - [ ] Arquivo: `src/stores/pageRightSidebarStore.ts`
  - [ ] Estado separado do rightSidebarStore global
  - [ ] Gerenciamento por página/aba

- [ ] Integrar no ModeloFormPage
  - [ ] Substituir botão global por PageRightSidebar
  - [ ] Testar abertura/fechamento
  - [ ] Validar altura limitada

#### 5.7.4 - Sidebar Avançada: Busca
- [ ] Campo de busca no topo
  - [ ] Input com ícone de busca
  - [ ] Botão X para limpar
  - [ ] Placeholder "Buscar..."

- [ ] Filtragem em tempo real
  - [ ] Filtrar por nome de página
  - [ ] Manter agrupamento por categoria
  - [ ] Exibir "Nenhum resultado" quando vazio

- [ ] Resultados da busca
  - [ ] Mostrar categoria de cada item
  - [ ] Manter ícones
  - [ ] Click abre página

#### 5.7.5 - Sidebar Avançada: Favoritos
- [ ] Criar favoritesStore
  - [ ] Arquivo: `src/stores/favoritesStore.ts`
  - [ ] Estado: array de tipos favoritos
  - [ ] Funções: addFavorite, removeFavorite, isFavorite
  - [ ] Persistência em localStorage

- [ ] Seção FAVORITOS
  - [ ] Exibir no topo da sidebar
  - [ ] Contador de favoritos
  - [ ] Ícone estrela amarela
  - [ ] Botão X vermelho para remover

- [ ] Botão favoritar
  - [ ] Adicionar estrela em cada item da sidebar
  - [ ] Toggle ao clicar
  - [ ] Feedback visual (amarelo quando favoritado)

#### 5.7.6 - Sidebar Avançada: Recentes
- [ ] Criar recentsStore
  - [ ] Arquivo: `src/stores/recentsStore.ts`
  - [ ] Estado: array de acessos recentes (limite 10)
  - [ ] Funções: addRecent, clearRecents
  - [ ] Persistência em localStorage

- [ ] Seção RECENTES
  - [ ] Exibir após FAVORITOS
  - [ ] Contador de recentes
  - [ ] Ícone relógio
  - [ ] Botão lixeira para limpar histórico

- [ ] Integração com abas
  - [ ] Adicionar a recentes ao abrir aba
  - [ ] Manter ordem cronológica (mais recente primeiro)
  - [ ] Remover duplicatas

**Tempo Estimado:** 3-4 horas  
**Commits:**
- "FIX: Correções críticas (isolamento estado + scroll + accordion)"
- "REFACTOR: Ajustes visuais (PageHeader + TabsBar)"
- "FEATURE: RightSidebar de página"
- "FEATURE: Busca na sidebar"
- "FEATURE: Sistema de favoritos"
- "FEATURE: Sistema de recentes"

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

---

## 📊 RESUMO DO PLANO

| Fase | Foco | Status | Arquivos | Commits |
|------|------|--------|----------|---------|
| 1 | Layout Visual | ✅ Concluída | 5 arquivos | 1 |
| 2 | Stores + Types | ✅ Concluída | 12 arquivos | 3 |
| 3 | Sistema Abas | ✅ Concluída | 7 arquivos | 2 |
| 4 | Complementos | ✅ Concluída | 8 arquivos | 4 |
| 5 | Páginas Modelo | ✅ Concluída | 10 arquivos | 6 |
| 5.7 | Refinamentos | 🔄 Atual | ~8 arquivos | ~6 |
| 6 | Autenticação | 🔜 Próxima | ~5 arquivos | ~3 |
| **TOTAL** | | **77%** | **~55 arquivos** | **25 commits** |

---

## ✅ CRITÉRIOS DE CONCLUSÃO

### Fase 1 Concluída:
- [x] Layout renderiza sem erros
- [x] Header, Sidebar e MainContent visíveis
- [x] Rota /app funciona

### Fase 2 Concluída:
- [x] Todos os stores criados
- [x] Types compilam sem erros
- [x] Registries exportam corretamente

### Fase 3 Concluída:
- [x] Click no menu abre aba (funcional, aguardando páginas)
- [x] Múltiplas abas funcionam
- [x] Close tab funciona
- [x] Modal confirmação funciona

### Fase 4 Concluída:
- [x] Header totalmente funcional
- [x] RightSidebar abre/fecha
- [x] Command Palette funciona (Ctrl+K)
- [x] Todos os atalhos funcionam
- [x] Sidebar avançada (3 modos + pin + persistência)

### Fase 5 Concluída:
- [x] Componentes reutilizáveis criados
- [x] NotFound funciona
- [x] 3 páginas modelo funcionam 100%
- [x] Todas as funcionalidades testadas
- [x] Sistema = template completo

### Fase 5.7 Concluída:
- [x] Estado isolado entre abas funcionando (useTabState + useTabForm)
- [x] Scroll isolado e condicional em todas áreas (body/root overflow-hidden + min-w-0)
- [x] Accordion sem seta duplicada (ChevronRight com rotate-90)
- [ ] Alturas ajustadas (PageHeader + TabsBar)
- [ ] PageRightSidebar funcional
- [ ] Busca na sidebar operacional
- [ ] Sistema de favoritos implementado
- [ ] Sistema de recentes implementado
- [x] Correções críticas testadas e validadas (5.7.1 completa)

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
