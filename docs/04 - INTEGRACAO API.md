<!-- markdownlint-disable-file -->
# Plano de Ação v2 — Integração Frontend com Backend API
## ARJSYS ERP — TCC Pós-graduação Desenvolvimento Web

---

## Mudança Principal em Relação ao Plano v1

O frontend agora será organizado **por setor**, espelhando o backend:

| Backend (setor) | Frontend (pastas) | Conteúdo |
|---|---|---|
| **Engenharia** | `types/engenharia/`, `stores/engenharia/`, `pages/engenharia/`, `components/engenharia/` | Produtos, BOM, Grupos, Vínculos, Configurações |
| **Admin** | `types/admin/`, `stores/admin/`, `pages/admin/`, `components/admin/` | Clientes, Funcionários, Permissões, Login |
| **Comercial** | `types/comercial/`, `stores/comercial/`, `pages/comercial/`, `components/comercial/` | Pedidos de Venda, Itens, Número de Série |
| **PCP** | (futuro) | Necessidade Material, Ordens Produção |
| **Compras** | (futuro) | Pedido de Compra |
| **Almoxarifado** | (futuro) | Estoque, Movimentações |

**"Cadastros" não é setor** — Produtos pertence a Engenharia, Clientes pertence a Admin.

---

## O Que Muda no Frontend Existente

### Arquivos a REMOVER (após cada fase estar testada)
```
app/src/data/cadastros/mockProdutos.ts          → remover após Fase 3
app/src/data/engenharia/mockBOMRelacional.ts     → remover após Fase 4
app/src/data/                                    → remover pasta inteira quando vazia
app/src/registries/cadastrosRegistry.ts          → substituído na Fase 1
```

### Arquivos a MOVER / RENOMEAR
```
ORIGEM                                           → DESTINO
─────────────────────────────────────────────────────────────────
types/cadastros/produto.types.ts                 → types/engenharia/produto.types.ts
stores/cadastros/produtosStore.ts                → stores/engenharia/produtosStore.ts
pages/cadastros/ProdutosPage.tsx                 → pages/engenharia/ProdutosPage.tsx
components/cadastros/DeleteProdutoDialog.tsx      → components/engenharia/DeleteProdutoDialog.tsx
components/cadastros/ProdutoCard.tsx              → components/engenharia/ProdutoCard.tsx
components/cadastros/ProdutoFormModal.tsx         → components/engenharia/ProdutoFormModal.tsx
```

### Pastas a REMOVER (quando ficarem vazias)
```
app/src/types/cadastros/
app/src/stores/cadastros/
app/src/pages/cadastros/
app/src/components/cadastros/
```

### Registries — Reorganização
```
REMOVER:   registries/cadastrosRegistry.ts
REMOVER:   registries/vendasRegistry.ts        (vazio, substituir por comercialRegistry)

MANTER:    registries/engenhariaRegistry.ts    (atualizar: absorve Produtos do cadastrosRegistry)
MANTER:    registries/comprasRegistry.ts       (manter vazio por enquanto)
MANTER:    registries/producaoRegistry.ts      (manter vazio por enquanto)
MANTER:    registries/modelosRegistry.ts       (manter)

CRIAR:     registries/adminRegistry.ts         (Clientes, Funcionários — Fase 5)
CRIAR:     registries/comercialRegistry.ts     (Pedidos, N.Série — Fase 6)
```

### Sidebar CATEGORIES — Atualizar
```typescript
// ANTES (errado — "cadastros" não é setor)
const CATEGORIES = [
    { id: 'cadastros', label: 'CADASTROS', icon: Users },
    { id: 'vendas', label: 'VENDAS', icon: ShoppingCart },
    { id: 'producao', label: 'PRODUÇÃO', icon: Package },
    { id: 'compras', label: 'COMPRAS', icon: Truck },
    { id: 'engenharia', label: 'ENGENHARIA', icon: Wrench },
    { id: 'modelos', label: 'PÁGINAS MODELO', icon: FileCode2 },
];

// DEPOIS (espelha setores do backend)
const CATEGORIES = [
    { id: 'engenharia', label: 'ENGENHARIA', icon: Wrench },
    { id: 'comercial', label: 'COMERCIAL', icon: ShoppingCart },
    { id: 'admin', label: 'ADMIN', icon: Users },
    { id: 'producao', label: 'PRODUÇÃO', icon: Package },
    { id: 'compras', label: 'COMPRAS', icon: Truck },
    { id: 'almoxarifado', label: 'ALMOXARIFADO', icon: Warehouse },
    { id: 'modelos', label: 'PÁGINAS MODELO', icon: FileCode2 },
];
```

### tab.types.ts — Atualizar TabType
```typescript
// ANTES
export type TabType =
    | 'modelo-lista' | 'modelo-form' | 'modelo-complexo'
    | 'clientes-lista' | 'cliente-cadastro'
    | 'produtos-lista' | 'produto-cadastro'
    | 'fornecedores-lista' | 'fornecedor-cadastro'
    | 'pedidos-lista' | 'pedido-cadastro'
    | 'ordens-lista' | 'ordem-cadastro' | 'kanban'
    | 'requisicoes-lista' | 'requisicao-cadastro'
    | 'estrutura-produto' | 'roteiro-fabricacao';

// DEPOIS (organizado por setor)
export type TabType =
    // Modelos
    | 'modelo-lista' | 'modelo-form' | 'modelo-complexo'
    // Engenharia
    | 'eng-produtos' | 'eng-estrutura' | 'eng-grupos' | 'eng-configuracoes'
    // Admin
    | 'adm-clientes' | 'adm-funcionarios'
    // Comercial
    | 'com-pedidos-venda' | 'com-numero-serie'
    // Produção (futuro)
    | 'pcp-ordens' | 'pcp-kanban'
    // Compras (futuro)
    | 'cpr-requisicoes'
    // Almoxarifado (futuro)
    | 'alm-estoque';
```

### registry.types.ts — Atualizar category
```typescript
category: 'engenharia' | 'admin' | 'comercial' | 'producao' | 'compras' | 'almoxarifado' | 'modelos';
```

### Imports a Atualizar (todos que referenciam caminhos antigos)
Qualquer arquivo que importe de `cadastros/` precisa atualizar para `engenharia/`:
```typescript
// ANTES
import type { Produto } from '@/types/cadastros/produto.types';
import { useProdutosStore } from '@/stores/cadastros/produtosStore';
import { ProdutosPage } from '@/pages/cadastros/ProdutosPage';

// DEPOIS
import type { Produto } from '@/types/engenharia/produto.types';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { ProdutosPage } from '@/pages/engenharia/ProdutosPage';
```

---

## Contexto Técnico (mantido do v1)

### Stack
- Frontend: React 19, TypeScript, Vite 7, TailwindCSS 4.1, TanStack Router, Zustand, shadcn/ui (NY), pnpm
- Backend: ASP.NET Core 10 + EF Core + SQLite em `http://localhost:7000`
- Sem JWT — login retorna dados + permissões, armazenar no Zustand
- Erros: `{ "erro": "mensagem" }` com status 400/401
- Enums são strings PascalCase no JSON
- IDs são int sequenciais

### Regras Críticas Zustand
```typescript
// ❌ ERRADO — causa loop infinito
const { produtos, isLoading } = useStore(s => ({ produtos: s.produtos, isLoading: s.isLoading }));

// ✅ CORRETO — seletores separados
const produtos = useStore(s => s.produtos);
const isLoading = useStore(s => s.isLoading);
```

### Funcionários de Teste
| Usuário | Cargo | Senha | Perfil |
|---------|-------|-------|--------|
| joao.silva | Diretor | 123 | Admin em todos |
| carlos.lima | Engenheiro | 123 | LeituraEscrita Engenharia |
| maria.souza | Gerente Comercial | 123 | LeituraEscrita Comercial |
| marcos.rocha | Admin TI | 123 | Admin em todos |

---

## Fases de Implementação

---

### FASE 1 — Base + Reorganização
**Objetivo:** Criar cliente HTTP, alinhar tipos com backend, reorganizar pastas por setor.
**Commit:** `REFACTOR: reorganiza por setor + lib/api.ts + tipos alinhados com backend`

#### 1.1 — CRIAR `app/src/lib/api.ts`
Cliente HTTP centralizado com fetch nativo.

#### 1.2 — CRIAR `app/src/types/auth.types.ts` (SUBSTITUIR)
Alinhar: `email/password` → `usuario/senha`, `User` → `FuncionarioLogado` + `Permissao[]`.

#### 1.3 — CRIAR `app/src/types/engenharia/produto.types.ts` (SUBSTITUIR)
Enums PascalCase, campos alinhados com backend, id: number.

#### 1.4 — CRIAR `app/src/types/engenharia/bom.types.ts` (SUBSTITUIR)
Campos alinhados com endpoints BOM reais.

#### 1.5 — ATUALIZAR `app/src/types/tab.types.ts`
Novos TabTypes organizados por setor.

#### 1.6 — ATUALIZAR `app/src/types/registry.types.ts`
Categories alinhadas com setores.

#### 1.7 — ATUALIZAR `app/src/registries/engenhariaRegistry.ts`
Absorve Produtos (que era de cadastrosRegistry).

#### 1.8 — ATUALIZAR `app/src/registries/index.ts`
Remove cadastrosRegistry e vendasRegistry, adiciona adminRegistry e comercialRegistry.

#### 1.9 — MOVER arquivos de `cadastros/` para `engenharia/`
Componentes, pages, stores — atualizar imports.

#### 1.10 — REMOVER
- `registries/cadastrosRegistry.ts`
- `registries/vendasRegistry.ts`
- `types/cadastros/` (pasta)
- `stores/cadastros/` (pasta)
- `pages/cadastros/` (pasta)
- `components/cadastros/` (pasta)

**Após Fase 1:** TypeScript vai reclamar em stores/pages/componentes porque os tipos mudaram. Isso é esperado — será corrigido nas fases seguintes.

---

### FASE 2 — Autenticação Real
**Objetivo:** Login funcional com backend, permissões no Zustand, controle de menu.
**Depende de:** Fase 1 completa
**Commit:** `FEATURE: autenticacao real com backend e controle de permissoes`

#### 2.1 — REFAZER `stores/authStore.ts`
- `login(credentials)` → `POST /api/admin/Auth/login`
- Armazena `FuncionarioLogado` no Zustand com `persist`
- Helper `temPermissao(modulo, nivelMinimo)`
- `logout()` limpa store

#### 2.2 — ATUALIZAR `pages/auth/LoginPage.tsx`
- Campo `usuario` (não email) + `senha`
- Remover "Modo Desenvolvimento"
- Tratar `{ "erro": "msg" }` do backend

#### 2.3 — ATUALIZAR `layouts/Sidebar.tsx`
- Ler permissões do authStore
- Esconder/mostrar categorias conforme módulo e nível
- Atualizar CATEGORIES para setores reais

**Teste:** joao.silva/123 → vê tudo | carlos.lima/123 → só Engenharia | login inválido → erro

---

### FASE 3 — Produtos (Engenharia) com API Real
**Objetivo:** Substituir mock de produtos por dados reais.
**Depende de:** Fase 1 e 2 completas
**Commit:** `FEATURE: produtos engenharia integrado com API real`

#### 3.1 — REFAZER `stores/engenharia/produtosStore.ts`
- `fetchProdutos()` → `GET /api/engenharia/Produtos`
- CRUD completo via API
- Remover import de mockProdutos

#### 3.2 — ATUALIZAR `pages/engenharia/ProdutosPage.tsx`
- Usar store real
- Botão "Varredura de Documentos"
- Botão de desenho baseado em `temDocumento`

#### 3.3 — ATUALIZAR componentes em `components/engenharia/`
- ProdutoCard, ProdutoFormModal, DeleteProdutoDialog
- Alinhar campos e enums com tipos novos

#### 3.4 — REMOVER `data/cadastros/mockProdutos.ts`

**Teste:** Lista 70 produtos reais, CRUD funciona, varredura aparece

---

### FASE 4 — BOM (Engenharia) com API Real
**Objetivo:** Substituir mock de BOM por dados reais.
**Depende de:** Fase 3 completa
**Commit:** `FEATURE: BOM engenharia integrado com API real`

#### 4.1 — REFAZER `stores/engenharia/bomStore.ts`
- `fetchBomFlat()` → `GET /api/engenharia/Bom/flat`
- `fetchBomPorProduto(id)` → `GET /api/engenharia/Bom/produto/{id}`
- CRUD via API

#### 4.2 — ATUALIZAR `pages/engenharia/BOMPage.tsx`

#### 4.3 — ATUALIZAR componentes BOM
- BOMFlatView, BOMTreeView, BOMTreeNode — remover imports de mock

#### 4.4 — ATUALIZAR `hooks/useBOMFlatState.ts`

#### 4.5 — REMOVER `data/engenharia/mockBOMRelacional.ts`
#### 4.6 — REMOVER pasta `data/` inteira (se vazia)

**Teste:** Flat view 50+ itens, tree view funciona, CRUD BOM

---

### FASE 5 — Admin (Clientes e Funcionários)
**Objetivo:** Telas CRUD para Clientes e Funcionários.
**Depende de:** Fase 2 completa
**Commit:** `FEATURE: modulo admin clientes e funcionarios`

#### 5.1 — CRIAR tipos em `types/admin/`
- `cliente.types.ts`
- `funcionario.types.ts`

#### 5.2 — CRIAR stores em `stores/admin/`
- `clientesStore.ts` → CRUD `/api/admin/Clientes`
- `funcionariosStore.ts` → CRUD `/api/admin/Funcionarios`

#### 5.3 — CRIAR pages e components em `pages/admin/` e `components/admin/`

#### 5.4 — CRIAR `registries/adminRegistry.ts`

---

### FASE 6 — Comercial (Pedidos e Número de Série)
**Objetivo:** Pedidos de venda com controle de status e número de série.
**Depende de:** Fase 2 completa
**Commit:** `FEATURE: modulo comercial pedidos e numero serie`

#### 6.1 — CRIAR tipos em `types/comercial/`
#### 6.2 — CRIAR stores em `stores/comercial/`
#### 6.3 — CRIAR pages e components
#### 6.4 — CRIAR `registries/comercialRegistry.ts`

---

### FASE 7 — Configurações de Engenharia
**Depende de:** Fase 3
**Commit:** `FEATURE: configuracoes engenharia`

---

### FASE 8 — Grupos de Produto e Vínculos
**Depende de:** Fase 3
**Commit:** `FEATURE: grupos produto e vinculos`

---

## Checklist de Commits

- [x] `REFACTOR: reorganiza por setor + lib/api.ts + tipos alinhados com backend` (Fase 1)
- [x] `FEATURE: autenticacao real com backend e controle de permissoes` (Fase 2)
- [x] `FEATURE: produtos engenharia integrado com API real` (Fase 3)
- [x] `FEATURE: BOM engenharia integrado com API real` (Fase 4)
- [ ] `FEATURE: modulo admin clientes e funcionarios` (Fase 5)
- [ ] `FEATURE: modulo comercial pedidos e numero serie` (Fase 6)
- [ ] `FEATURE: configuracoes engenharia` (Fase 7)
- [ ] `FEATURE: grupos produto e vinculos` (Fase 8)

---

## Observações

- Sempre testar cada fase antes de avançar
- Manter mocks até a fase correspondente estar testada
- Backend sem JWT — sem Authorization header
- Paginação: sem params retorna tudo; `?pagina=1&tamanho=20` quando necessário
