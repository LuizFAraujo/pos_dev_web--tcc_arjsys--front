<!-- markdownlint-disable-file -->
# 🌳 ESTRUTURA DO PROJETO - ARJSYS FRONTEND

**Versão:** Estrutura Final (após todas as 6 fases)  
**Base:** React 19 + TypeScript + Vite + TanStack Router + Zustand + shadcn/ui

---

## 📦 ESTRUTURA COMPLETA

```
pos_dev_web--tcc_front--arjsys/
├── package.json               # Workspace root (scripts centralizados)
├── pnpm-workspace.yaml        # Configuração workspace
├── README.md
├── .gitignore
│
├── docs/                      # Documentação do projeto
│   ├── PLANO_DE_ACAO.md
│   └── ESTRUTURA_PROJETO.md
│
└── app/                       # Aplicação principal
    ├── package.json           # Dependências do app
    ├── pnpm-lock.yaml
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── tsconfig.paths.json
    ├── components.json        # Configuração shadcn/ui
    │
    ├── public/                # Assets estáticos
    │
    └── src/
        │
        ├── components/
        │   ├── shared/     # Componentes reutilizáveis
        │   │   ├── PageHeader.tsx              ✅
        │   │   ├── PageWrapper.tsx             ✅
        │   │   └── Breadcrumb.tsx              📌 FASE 5
        │   │
        │   ├── sidebars/     # Conteúdos RightSidebar
        │   │   ├── NotificationsContent.tsx   ✅
        │   │   ├── SessionsContent.tsx        ✅
        │   │   ├── SettingsContent.tsx        ✅
        │   │   └── StatsContent.tsx           ✅
        │   │
        │   ├── ui/     # shadcn/ui components
        │   │   ├── avatar.tsx        ✅
        │   │   ├── accordion.tsx     ✅
        │   │   ├── alert-dialog.tsx  ✅
        │   │   ├── badge.tsx         ✅
        │   │   ├── button.tsx        ✅
        │   │   ├── breadcrumb.tsx    ✅
        │   │   ├── card.tsx          ✅
        │   │   ├── command.tsx       ✅
        │   │   ├── dialog.tsx        ✅
        │   │   ├── dropdown-menu.tsx ✅
        │   │   ├── form.tsx          ✅
        │   │   ├── input.tsx         ✅
        │   │   ├── label.tsx         ✅
        │   │   ├── popover.tsx       ✅
        │   │   ├── select.tsx        ✅
        │   │   ├── sheet.tsx         ✅
        │   │   ├── table.tsx         ✅
        │   │   ├── tabs.tsx          ✅
        │   │   ├── textarea.tsx      ✅
        │   │   └── tooltip.tsx       ✅
        │   │
        │   └── workspace/     # Componentes do workspace
        │       ├── CommandPalette.tsx          ✅
        │       ├── ConfirmCloseDialog.tsx      ✅
        │       ├── EmptyWorkspace.tsx          ✅
        │       ├── TabContainer.tsx            ✅
        │       ├── TabsBar.tsx                 ✅
        │       ├── TabUnderConstruction.tsx    ✅
        │       └── WorkspaceContent.tsx        ✅
        │    
        ├── hooks/     # Custom hooks    
        │   ├── useKeyboardShortcuts.ts         ✅
        │   ├── useTabForm.ts                   ✅
        │   └── useTabState.ts                  ✅
        │   
        ├── layouts/     # Layouts principais
        │   ├── AuthLayout.tsx                  📌 FASE 6
        │   ├── Header.tsx                      ✅
        │   ├── MainContent.tsx                 ✅
        │   ├── RightSidebar.tsx                ✅
        │   ├── Sidebar.tsx                     ✅
        │   └── WorkspaceLayout.tsx             ✅
        │    
        ├── lib/     # Utilitários    
        │   └── utils.ts                        ✅
        │
        ├── pages/     # Páginas do sistema
        │   │
        │   ├── auth/     # Autenticação
        │   │   ├── LoginPage.tsx               📌 FASE 6
        │   │   └── NotFoundPage.tsx            ✅
        │   │
        │   ├── models/     # Páginas modelo (templates)
        │   │   ├── ModeloListaPage.tsx         ✅
        │   │   ├── ModeloFormPage.tsx          ✅
        │   │   └── ModeloComplexoPage.tsx      ✅
        │   │
        │   ├── cadastros/     # Módulo Cadastros
        │   │   ├── clientes/
        │   │   │   ├── ClientesListaPage.tsx      🔮 FUTURO
        │   │   │   └── ClienteCadastroPage.tsx    🔮 FUTURO
        │   │   ├── produtos/
        │   │   │   ├── ProdutosListaPage.tsx      🔮 FUTURO
        │   │   │   └── ProdutoCadastroPage.tsx    🔮 FUTURO
        │   │   └── fornecedores/
        │   │       ├── FornecedoresListaPage.tsx  🔮 FUTURO
        │   │       └── FornecedorCadastroPage.tsx 🔮 FUTURO
        │   │
        │   ├── vendas/     # Módulo Vendas
        │   │   └── pedidos/
        │   │       ├── PedidosListaPage.tsx       🔮 FUTURO
        │   │       └── PedidoCadastroPage.tsx     🔮 FUTURO
        │   │
        │   ├── producao/     # Módulo Produção
        │   │   ├── ordens/
        │   │   │   ├── OrdensListaPage.tsx        🔮 FUTURO
        │   │   │   └── OrdemCadastroPage.tsx      🔮 FUTURO
        │   │   └── kanban/
        │   │       └── KanbanPage.tsx             🔮 FUTURO
        │   │
        │   ├── compras/     # Módulo Compras
        │   │   └── requisicoes/
        │   │       ├── RequisicoesListaPage.tsx   🔮 FUTURO
        │   │       └── RequisicaoCadastroPage.tsx 🔮 FUTURO
        │   │
        │   └── engenharia/     # Módulo Engenharia
        │       ├── estrutura/
        │       │   └── EstruturaProdutoPage.tsx   🔮 FUTURO
        │       └── roteiro/
        │           └── RoteiroFabricacaoPage.tsx  🔮 FUTURO
        │
        ├── registries/     # Registry Pattern
        │   ├── index.ts                        ✅
        │   ├── cadastrosRegistry.ts            ✅
        │   ├── comprasRegistry.ts              ✅
        │   ├── engenhariaRegistry.ts           ✅
        │   ├── modelsRegistry.ts               ✅
        │   ├── producaoRegistry.ts             ✅
        │   └── vendasRegistry.ts               ✅
        │    
        ├── routes/     # TanStack Router    
        │   ├── __root.tsx                      ✅
        │   ├── index.tsx                       ✅
        │   ├── app.tsx                         ✅
        │   └── login.tsx                       📌 FASE 6
        │
        ├── stores/     # Zustand stores
        │   ├── index.ts                        ✅
        │   ├── authStore.ts                    📌 FASE 6
        │   ├── rightSidebarStore.ts            ✅
        │   ├── sidebarStore.ts                 ✅
        │   ├── tabsStore.ts                    ✅
        │   ├── useAppStore.ts                  ✅
        │   └── themeStore.ts                   ✅
        │    
        ├── styles/     # Estilos    
        │   └── tailwind.css                    ✅
        │    
        ├── types/     # TypeScript types    
        │   ├── tab.types.ts                    ✅
        │   ├── registry.types.ts               ✅
        │   └── auth.types.ts                   📌 FASE 6
        │    
        ├── App.tsx                             ✅
        ├── main.tsx                            ✅
        ├── routeTree.gen.ts                    ✅ Gerado automaticamente
        └── vite-env.d.ts                       ✅
```

---

## 📊 ESTATÍSTICAS POR FASE

### ✅ **JÁ EXISTE (Setup Base)**
- 15 arquivos base
- 3 componentes shadcn/ui (button, card, input)
- Estrutura de pastas criada

### 📌 **FASE 1: Estrutura Visual**
**Novos:** 5 arquivos
- 4 layouts (WorkspaceLayout, Header, Sidebar, MainContent)
- 1 rota (app.tsx)

**Atualizados:** 2 arquivos
- routes/__root.tsx
- routes/index.tsx

### 📌 **FASE 2: Lógica e Estado**
**Novos:** 13 arquivos
- 5 stores (tabs, sidebar, rightSidebar, theme, index)
- 6 registries (5 módulos + models + index)
- 2 types (tab.types, registry.types)

### 📌 **FASE 3: Integração Funcional**
**Novos:** 5 componentes workspace
- TabsBar, WorkspaceContent, TabContainer, EmptyWorkspace, TabUnderConstruction

**Atualizados:** 1 arquivo
- layouts/Sidebar.tsx (conectar com stores)

**shadcn:** 4 componentes
- accordion, tooltip, dialog, alert-dialog

### 📌 **FASE 4: Complementos**
**Novos:** 6 arquivos
- 1 layout (RightSidebar)
- 4 sidebars (Settings, Notifications, Sessions, Stats)
- 1 hook (useKeyboardShortcuts)

**Atualizados:** 2 arquivos
- layouts/Header.tsx (funcionalidades completas)
- layouts/WorkspaceLayout.tsx (integrar RightSidebar)

**shadcn:** 5 componentes
- dropdown-menu, avatar, badge, popover, sheet, command

### 📌 **FASE 5: Páginas Modelo**
**Novos:** 7 arquivos
- 3 shared components (PageHeader, PageWrapper, Breadcrumb)
- 1 auth page (NotFoundPage)
- 3 model pages (Lista, Form, Complexo)

**Atualizados:** 1 arquivo
- registries/modelsRegistry.ts (registrar páginas)

**shadcn:** 6 componentes
- breadcrumb, form, label, textarea, select, tabs, table

### 📌 **FASE 6: Autenticação**
**Novos:** 5 arquivos
- 1 layout (AuthLayout)
- 1 page (LoginPage)
- 1 store (authStore)
- 1 type (auth.types)
- 1 rota (login.tsx)

**Atualizados:** 2 arquivos
- routes/__root.tsx (proteção)
- layouts/Header.tsx (logout)

---

## 📈 RESUMO TOTAL

| Categoria | Quantidade |
|-----------|------------|
| **Arquivos Existentes** | 15 |
| **Arquivos Novos** | 44 |
| **Arquivos Atualizados** | 8 |
| **Componentes shadcn** | 21 |
| **Total Final** | ~59 arquivos |

---

## 🎯 ESTRUTURA POR DOMÍNIO

### 🎨 **UI/Apresentação**
- `components/ui/` - shadcn/ui (21 componentes)
- `components/workspace/` - Abas (5 componentes)
- `components/sidebars/` - RightSidebar (4 conteúdos)
- `components/shared/` - Reutilizáveis (3 componentes)
- `layouts/` - Estruturas de página (6 layouts)

### 📄 **Páginas**
- `pages/auth/` - Autenticação (2 páginas)
- `pages/models/` - Templates (3 páginas)
- `pages/cadastros/` - CRUD Cadastros (futuro)
- `pages/vendas/` - Vendas (futuro)
- `pages/producao/` - Produção (futuro)
- `pages/compras/` - Compras (futuro)
- `pages/engenharia/` - Engenharia (futuro)

### 🧠 **Lógica/Estado**
- `stores/` - Zustand (6 stores)
- `registries/` - Registry Pattern (6 registries)
- `types/` - TypeScript (3 arquivos)
- `hooks/` - Custom hooks (1 hook)

### 🛣️ **Roteamento**
- `routes/` - TanStack Router (4 rotas base)

### 🎨 **Estilos**
- `styles/` - Tailwind CSS (1 arquivo)

---

## 🔑 CONVENÇÕES

### **Nomenclatura de Arquivos:**
- Componentes: `PascalCase.tsx` (ex: `TabsBar.tsx`)
- Stores: `camelCase.ts` (ex: `tabsStore.ts`)
- Types: `kebab-case.types.ts` (ex: `tab.types.ts`)
- Hooks: `useNome.ts` (ex: `useKeyboardShortcuts.ts`)

### **Nomenclatura de Pastas:**
- Módulos: `lowercase` (ex: `cadastros/`, `vendas/`)
- Subdomínios: `lowercase` (ex: `clientes/`, `produtos/`)

### **Organização por Setor:**
```
pages/
├── cadastros/
│   ├── clientes/
│   │   ├── ClientesListaPage.tsx
│   │   └── ClienteCadastroPage.tsx
│   └── produtos/
│       ├── ProdutosListaPage.tsx
│       └── ProdutoCadastroPage.tsx
└── vendas/
    └── pedidos/
        ├── PedidosListaPage.tsx
        └── PedidoCadastroPage.tsx
```

### **Imports Aliases:**
- `@/` → `src/`
- `@components/` → `src/components/`
- `@ui/` → `src/components/ui/`
- `@stores` → `src/stores/`
- `@types/` → `src/types/`
- E outros conforme `tsconfig.paths.json`

---

## 🎨 PADRÕES DE CÓDIGO

### **Componentes:**
```tsx
// Header com comentário descritivo
/**
 * NomeComponente - Descrição breve
 * 
 * Detalhes adicionais se necessário
 */

export function NomeComponente() {
  // Código
}
```

### **Stores:**
```typescript
import { create } from 'zustand';

interface NomeState {
  // Estado
}

export const useNomeStore = create<NomeState>((set) => ({
  // Implementação
}));
```

### **Registry:**
```typescript
import { TabRegistry } from '@types/registry.types';

export const nomeRegistry: TabRegistry = {
  'tipo-da-aba': {
    defaultTitle: 'Título',
    icon: IconeDoLucide,
    component: ComponenteDaPagina,
    category: 'nome-modulo'
  }
};
```

---

## 📚 DOCUMENTAÇÃO

### **Arquivos de Documentação:**
- `docs/PLANO_DE_ACAO.md` - Plano completo com checkboxes
- `docs/ESTRUTURA_PROJETO.md` - Este arquivo
- `README.md` (raiz) - Visão geral do projeto

### **Onde Documentar:**
- Componentes complexos: JSDoc no topo do arquivo
- Funções utilitárias: JSDoc inline
- Stores: Comentário no arquivo descrevendo propósito
- Types: Comentários inline quando necessário

---

## 🚀 PRÓXIMOS PASSOS APÓS FASE 6

1. **Implementar CRUDs Reais:**
   - Clientes (lista + cadastro)
   - Produtos (lista + cadastro)
   - Fornecedores (lista + cadastro)

2. **Funcionalidades Específicas:**
   - BOM (Bill of Materials) hierárquica
   - Pedidos de Venda
   - Ordens de Produção
   - Kanban

3. **Integração Backend:**
   - API .NET
   - Autenticação real (JWT)
   - CRUD completo

---

**Data de Criação:** [preencher]  
**Última Atualização:** [preencher]  
**Versão:** 1.0 (Estrutura Planejada)
