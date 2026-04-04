<!-- markdownlint-disable-file -->
<!-- 01 - ESTRUTURA PROJETO MVP EM DIANTE -->

# 🌳 ESTRUTURA DO PROJETO - ARJSYS ERP INDUSTRIAL

**Versão:** Estrutura Completa  
**Base:** React 19 + TypeScript + Vite + TanStack Router + Zustand + shadcn/ui

---

## 📦 ESTRUTURA COMPLETA
```
pos_dev_web--tcc_front--arjsys/
├── .gitignore
├── package.json                    # Workspace root
├── pnpm-workspace.yaml
├── README.md
│
├── docs/                           # Documentação
│   ├── ESTRUTURA_PROJETO.md
│   └── PLANO_DE_ACAO.md
│
└── app/                            # Aplicação principal
    ├── components.json             # Configuração shadcn/ui
    ├── index.html
    ├── package.json
    ├── pnpm-lock.yaml
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── tsconfig.paths.json
    ├── vite.config.ts
    │
    ├── public/                     # Assets estáticos
    │
    └── src/
        │
        ├── components/
        │   ├── admin/             # Componentes Admin
        │   │   ├── ClienteDeleteDialog.tsx        ✅
        │   │   ├── ClienteForm.tsx                ✅
        │   │   ├── FuncionarioDeleteDialog.tsx    ✅
        │   │   └── FuncionarioForm.tsx            ✅
        │   │
        │   ├── comercial/         # Componentes Comercial
        │   │   ├── PedidoForm.tsx                 ✅
        │   │   └── PedidoDeleteDialog.tsx         ✅
        │   │
        │   ├── engenharia/         # Componentes Engenharia
        │   │   ├── BomDeleteDialog.tsx            ✅
        │   │   ├── BOMFlatView.tsx                ✅
        │   │   ├── BOMForm.tsx                    ✅
        │   │   ├── GrupoDeleteDialog.tsx          ✅
        │   │   ├── GrupoForm.tsx                  ✅
        │   │   ├── NovaEstruturaDialog.tsx        ✅
        │   │   ├── ProdutoDeleteDialog.tsx        ✅
        │   │   ├── ProdutoForm.tsx                ✅
        │   │   └── ProdutoSelect.tsx              ✅
        │   │
        │   ├── projetos/           # Componentes Projetos
        │   │   ├── AlterarStatusDialog.tsx        📍 FALTA
        │   │   ├── DeletePedidoDialog.tsx         📍 FALTA
        │   │   ├── PedidoCard.tsx                 📍 FALTA
        │   │   ├── PedidoFormModal.tsx            📍 FALTA
        │   │   └── PedidoKanbanCard.tsx           📍 FALTA
        │   │
        │   ├── relatorios/         # Componentes Relatórios
        │   │   └── TabelaMateriaisExplosao.tsx    📍 FALTA
        │   │
        │   ├── shared/             # Componentes reutilizáveis
        │   │   ├── index.ts                       ✅
        │   │   ├── DataGrid/
        │   │   │   ├── index.ts                   ✅
        │   │   │   ├── ColFilterPopover.tsx       ✅
        │   │   │   ├── DataGrid.tsx               ✅
        │   │   │   ├── DataGridTree.tsx           ✅
        │   │   │   ├── FilterConditionRow.tsx     ✅
        │   │   │   └── types.ts                   ✅
        │   │   ├── PageShell/
        │   │   │   ├── index.ts                   ✅
        │   │   │   ├── PageShell.tsx              ✅
        │   │   │   ├── types.ts                   ✅
        │   │   │   └── usePageMode.tsx            ✅
        │   │   ├── AppTooltip.tsx                 ✅
        │   │   ├── CadGrid.tsx                    ✅
        │   │   ├── EmptyState.tsx                 📍 FALTA
        │   │   ├── ErrorState.tsx                 📍 FALTA
        │   │   ├── LoadingState.tsx               📍 FALTA
        │   │   ├── PageHeader.tsx                 ✅
        │   │   ├── PageRightSidebar.tsx           ✅
        │   │   ├── PageWrapper.tsx                ✅
        │   │   └── SearchBar.tsx                  ✅
        │   │
        │   ├── sidebars/           # Conteúdos RightSidebar
        │   │   ├── NotificationsContent.tsx       ✅
        │   │   ├── SessionsContent.tsx            ✅
        │   │   ├── SettingsContent.tsx            ✅
        │   │   └── StatsContent.tsx               ✅
        │   │
        │   ├── ui/                 # shadcn/ui components
        │   │   ├── accordion.tsx                  ✅
        │   │   ├── alert-dialog.tsx               ✅
        │   │   ├── avatar.tsx                     ✅
        │   │   ├── badge.tsx                      ✅
        │   │   ├── breadcrumb.tsx                 ✅
        │   │   ├── button.tsx                     ✅
        │   │   ├── calendar.tsx                   📍 FALTA
        │   │   ├── card.tsx                       ✅
        │   │   ├── checkbox.tsx                   ✅
        │   │   ├── command.tsx                    ✅
        │   │   ├── date-picker.tsx                📍 FALTA
        │   │   ├── dialog.tsx                     ✅
        │   │   ├── dropdown-menu.tsx              ✅
        │   │   ├── form.tsx                       ✅
        │   │   ├── input.tsx                      ✅
        │   │   ├── label.tsx                      ✅
        │   │   ├── popover.tsx                    ✅
        │   │   ├── radio-group.tsx                ✅
        │   │   ├── scroll-area.tsx                ✅
        │   │   ├── select.tsx                     ✅
        │   │   ├── sheet.tsx                      ✅
        │   │   ├── sonner.tsx                     ✅
        │   │   ├── switch.tsx                     ✅
        │   │   ├── table.tsx                      ✅
        │   │   ├── tabs.tsx                       ✅
        │   │   ├── textarea.tsx                   ✅
        │   │   └── tooltip.tsx                    ✅
        │   │
        │   └── workspace/          # Componentes Workspace
        │       ├── CommandPalette.tsx             ✅
        │       ├── ConfirmCloseDialog.tsx         ✅
        │       ├── EmptyWorkspace.tsx             ✅
        │       ├── TabContainer.tsx               ✅
        │       ├── TabsBar.tsx                    ✅
        │       ├── TabUnderConstruction.tsx       ✅
        │       └── WorkspaceContent.tsx           ✅
        │
        ├── data/                   # Mock data (REMOVER)
        │   ├── cadastros/
        │   │   ├── mockClientes.ts                📍 NÃO SERÁ NECESSARIO, DIRETO PELO BANCO
        │   │   ├── mockFuncionarios.ts            📍 NÃO SERÁ NECESSARIO, DIRETO PELO BANCO
        │   │   └── mockProdutos.ts                ✅ REMOVER
        │   │
        │   ├── engenharia/
        │   │   ├── mockBOMRelacional.ts           ✅ REMOVER
        │   │   └── mockDesenhos.ts                📍 NÃO SERÁ NECESSARIO, DIRETO PELO BANCO
        │   │
        │   └── projetos/
        │       └── mockPedidos.ts                 📍 NÃO SERÁ NECESSARIO, DIRETO PELO BANCO
        │
        ├── hooks/                  # Custom hooks
        │   ├── useBOMFlatState.ts                 ✅
        │   ├── useDeleteDialog.ts                 ✅
        │   ├── useFormTabNavigation.ts            ✅
        │   ├── useKeyboardShortcuts.ts            ✅
        │   ├── useListState.ts                    ✅
        │   ├── useRestoreFocus.ts                 ✅
        │   ├── useTabForm.ts                      ✅
        │   └── useTabState.ts                     ✅
        │
        ├── layouts/                # Layouts principais
        │   ├── Sidebar/
        │   │   ├── index.tsx                      ✅
        │   │   ├── constants.tsx                  ✅
        │   │   ├── Sidebar.tsx                    ✅
        │   │   ├── SidebarCompact.tsx             ✅
        │   │   ├── SidebarItemButton.tsx          ✅
        │   │   └── SidebarNormal.tsx              ✅
        │   ├── AuthLayout.tsx                     ✅
        │   ├── Header.tsx                         ✅
        │   ├── MainContent.tsx                    ✅
        │   ├── RightSidebar.tsx                   ✅
        │   └── WorkspaceLayout.tsx                ✅
        │
        ├── lib/                    # Utilitários
        │   ├── api.ts                             ✅
        │   └── utils.ts                           ✅
        │
        ├── pages/                  # Páginas do sistema
        │   ├── _modelos/           # Templates
        │   │   ├── ModeloComplexoPage.tsx         ✅
        │   │   ├── ModeloFormPage.tsx             ✅
        │   │   └── ModeloListaPage.tsx            ✅
        │   │
        │   ├── admin ??/           # Administração
        │   │   ├── LogsSistemaPage.tsx            📍 FALTA
        │   │   ├── PerfisAcessoPage.tsx           📍 FALTA
        │   │   └── UsuariosPage.tsx               📍 FALTA
        │   │
        │   ├── admin/              # Admin
        │   │   ├── ClientesPage.tsx               ✅
        │   │   └── FuncionariosPage.tsx           ✅
        │   │
        │   ├── almoxarifado/       # Almoxarifado
        │   │   ├── EntradaMaterialPage.tsx        📍 FALTA
        │   │   ├── ReservaProjetoPage.tsx         📍 FALTA
        │   │   ├── SaidaMaterialPage.tsx          📍 FALTA
        │   │   └── SaldoEstoquePage.tsx           📍 FALTA
        │   │
        │   ├── auth/               # Autenticação
        │   │   ├── LoginPage.tsx                  ✅
        │   │   └── NotFoundPage.tsx               ✅
        │   │
        │   ├── comercial/          # Comercial
        │   │   ├── NumeroSeriePage.tsx            ✅
        │   │   └── PedidosPage.tsx                ✅
        │   │
        │   ├── cadastros/          # Cadastros (verificar local correto a colocar)
        │   │   ├── ClientesPage.tsx               📍 FALTA
        │   │   ├── FuncionariosPage.tsx           📍 FALTA
        │   │
        │   ├── compras/            # Compras
        │   │   ├── NecessidadesComprasPage.tsx    📍 FALTA
        │   │   ├── SolicitacoesCompraPage.tsx     📍 FALTA
        │   │   └── StatusComprasPage.tsx          📍 FALTA
        │   │
        │   ├── engenharia/         # Engenharia
        │   │   ├── BibliotecaDesenhosPage.tsx     📍 FALTA
        │   │   ├── BOMPage.tsx                    ✅
        │   │   ├── ConfiguracoesPage.tsx          ✅
        │   │   ├── GruposPage.tsx                 ✅
        │   │   ├── EstruturaDetalhePage.tsx       📍 FALTA
        │   │   ├── EstruturasPage.tsx             📍 FALTA
        │   │   ├── ProdutosPage.tsx               ✅
        │   │   ├── RevisaoDesenhoPage.tsx         📍 FALTA
        │   │   └── WhereUsedPage.tsx              📍 FALTA
        │   │
        │   ├── producao/           # Produção
        │   │   ├── ApontamentoPage.tsx            📍 FALTA
        │   │   ├── FilaProducaoPage.tsx           📍 FALTA
        │   │   └── KanbanProducaoPage.tsx         📍 FALTA
        │   │
        │   ├── projetos/           # Projetos
        │   │   ├── CronogramaPage.tsx             📍 FALTA
        │   │   ├── KanbanPage.tsx                 📍 FALTA
        │   │   ├── PedidoDetalhePage.tsx          📍 FALTA
        │   │   └── PedidosPage.tsx                📍 FALTA
        │   │
        │   ├── qualidade/          # Qualidade
        │   │   ├── AprovacaoPage.tsx              📍 FALTA
        │   │   ├── InspecaoPage.tsx               📍 FALTA
        │   │   └── NaoConformidadePage.tsx        📍 FALTA
        │   │
        │   ├── relatorios/         # Relatórios
        │   │   ├── ExplosaoMateriaisPage.tsx      📍 FALTA
        │   │   └── RelatorioConsolidadoPage.tsx   📍 FALTA
        │   │
        │   └── DashboardPage.tsx                  📍 FALTA
        │
        ├── registries/             # Registry Pattern
        │   ├── index.ts                           ✅
        │   ├── adminRegistry.ts                   ✅ (atualizar nas fases)
        │   ├── almoxarifadoRegistry.ts            ✅ (atualizar nas fases)
        │   ├── comercialRegistry.ts               ✅ (atualizar nas fases)
        │   ├── comprasRegistry.ts                 ✅ (atualizar nas fases)
        │   ├── engenhariaRegistry.ts              ✅
        │   ├── modelsRegistry.ts                  ✅
        │   ├── producaoRegistry.ts                ✅ (atualizar nas fases)
        │   ├── projetosRegistry.ts                📍 FALTA
        │   ├── qualidadeRegistry.ts               📍 FALTA
        │   ├── relatoriosRegistry.ts              📍 FALTA
        │   └── vendasRegistry.ts                  ✅ (atualizar nas fases)
        │
        ├── routes/                 # TanStack Router
        │   ├── __root.tsx                         ✅
        │   ├── app.tsx                            ✅
        │   ├── index.tsx                          ✅
        │   └── login.tsx                          ✅
        │
        ├── services/               # Serviços
        │   ├── api/                # Integração Backend
        │   │   ├── apiClient.ts                   📍 FALTA
        │   │   ├── clientesService.ts             📍 FALTA
        │   │   ├── desenhosService.ts             📍 FALTA
        │   │   ├── estruturasService.ts           📍 FALTA
        │   │   ├── pedidosService.ts              📍 FALTA
        │   │   └── produtosService.ts             📍 FALTA
        │   │
        │   └── utils/              # Utilitários
        │       ├── explosaoMateriaisService.ts    📍 FALTA
        │       └── uploadService.ts               📍 FALTA
        │
        ├── stores/                 # Zustand stores
        │   ├── cadastros/          # Stores Cadastros  (verificar local correto a colocar)
        │   │   ├── clientesStore.ts               📍 FALTA ????
        │   │   ├── funcionariosStore.ts           📍 FALTA ????
        │   │
        │   ├── admin/             # Stores Admin
        │   │   ├── clientesStore.ts               ✅
        │   │   └── funcionariosStore.ts           ✅
        │   │
        │   ├── comercial/         # Stores Comercial
        │   │   ├── numeroSerieStore.ts            ✅
        │   │   └── pedidosStore.ts                ✅
        │   │
        │   ├── engenharia/         # Stores Engenharia
        │   │   ├── bomStore.ts                    ✅
        │   │   ├── configuracoesStore.ts          ✅
        │   │   ├── gruposStore.ts                 ✅
        │   │   ├── desenhosStore.ts               📍 FALTA
        │   │   └── produtosStore.ts               ✅
        │   │
        │   ├── projetos/           # Stores Projetos
        │   │   ├── kanbanStore.ts                 📍 FALTA
        │   │   └── pedidosStore.ts                📍 FALTA
        │   │
        │   ├── index.ts                           ✅
        │   ├── authStore.ts                       ✅
        │   ├── favoritesStore.ts                  ✅
        │   ├── pageRightSidebarStore.ts           ✅
        │   ├── recentsStore.ts                    ✅
        │   ├── rightSidebarStore.ts               ✅
        │   ├── sidebarStore.ts                    ✅
        │   ├── tabsStore.ts                       ✅
        │   ├── themeStore.ts                      ✅
        │   └── useAppStore.ts                     ✅
        │
        ├── styles/                 # Estilos
        │   └── tailwind.css                       ✅
        │
        ├── types/                  # TypeScript types
        │   ├── cadastros/          # Types Cadastros  (verificar local correto a colocar)
        │   │   ├── cliente.types.ts               📍 FALTA ????
        │   │   ├── funcionario.types.ts           📍 FALTA ????
        │   │
        │   ├── admin/              # Types Admin
        │   │   ├── cliente.types.ts               ✅
        │   │   └── funcionario.types.ts           ✅
        │   │
        │   ├── comercial/          # Types Comercial
        │   │   ├── numeroserie.types.ts           ✅
        │   │   └── pedido.types.ts                ✅
        │   │
        │   ├── engenharia/         # Types Engenharia
        │   │   ├── bom.types.ts                   ✅
        │   │   ├── configuracao.types.ts          ✅
        │   │   ├── grupo.types.ts                 ✅
        │   │   ├── componente.types.ts            📍 FALTA
        │   │   ├── desenho.types.ts               📍 FALTA
        │   │   └── produto.types.ts               ✅
        │   │
        │   ├── projetos/           # Types Projetos
        │   │   ├── kanban.types.ts                📍 FALTA
        │   │   └── pedido.types.ts                📍 FALTA
        │   │
        │   ├── shared/             # Types compartilhados
        │   │   ├── api.types.ts                   📍 FALTA
        │   │   └── common.types.ts                ✅
        │   │
        │   ├── auth.types.ts                      ✅
        │   ├── registry.types.ts                  ✅
        │   └── tab.types.ts                       ✅
        │
        ├── App.tsx                                ✅
        ├── main.tsx                               ✅
        ├── routeTree.gen.ts                       ✅ (gerado)
        └── vite-env.d.ts                          ✅
```

---

## 📊 RESUMO POR FASE

**MVP (FASES 1-7):** 9 páginas funcionais com mock + integração backend  
**PÓS-MVP (FASES 8-11):** Expansão funcionalidades + módulos avançados

---
