<!-- markdownlint-disable-file -->
<!-- 02 - PLANO DE AÇÃO MVP EM DIANTE -->

# 📋 PLANO DE AÇÃO - ARJSYS ERP INDUSTRIAL

**Objetivo:** Sistema ERP completo para indústria de máquinas agrícolas  
**Tecnologias:** React 19 + TypeScript + Vite + TanStack Router + Zustand + C# .NET

---

## 🎯 DIVISÃO GERAL

**FASES 1-6:** MVP Frontend (mock data)  
**FASE 7:** Integração Backend (.NET + SQLite)  
**FASES 8-11:** Expansão e módulos avançados

---
npm add -g pnpm
## 📅 FASE 1 - PRODUTOS

### 1.1 - Setup e Types
- [x] Criar `types/cadastros/produto.types.ts`
  - [x] Interface `Produto`
  - [x] Interface `ProdutoFormData`
  - [x] Type `TipoProduto` (FABRICADO | COMPRADO | MATERIA_PRIMA)
  - [x] Type `UnidadeMedida` (UN | KG | M | M2 | M3 | L)
  - [x] Interface `ProdutoFilters`

- [x] Criar `types/shared/common.types.ts`
  - [x] Type `Status`
  - [x] Type `SortOrder`
  - [x] Interface `Pagination`

- [x] Criar `data/cadastros/mockProdutos.ts`
  - [x] Array com 20 produtos
  - [x] Mix de tipos (fabricado, comprado, matéria-prima)
  - [x] Alguns com desenho, outros sem

### 1.2 - Store Zustand
- [x] Criar `stores/cadastros/produtosStore.ts`
  - [x] Estado: `produtos`, `isLoading`, `error`, `filters`
  - [x] Action: `loadProdutos()`
  - [x] Action: `createProduto()`
  - [x] Action: `updateProduto()`
  - [x] Action: `deleteProduto()`
  - [x] Action: `setFilters()`
  - [x] Action: `clearFilters()`
  - [x] Função: `generateCodigo()`

### 1.3 - Componentes shadcn/ui
- [x] Instalar `checkbox`
```bash
pnpm dlx shadcn@latest add checkbox
```

### 1.4 - Página Listagem
- [x] Criar `pages/cadastros/ProdutosPage.tsx`
- [x] PageWrapper + PageHeader
- [x] Breadcrumbs: "Cadastros > Produtos"
- [x] Botão "Novo Produto"
- [x] Campo busca (código/descrição)
- [x] Select tipo
- [x] Select possui desenho
- [x] Botão "Limpar Filtros"
- [x] Tabela: Código | Descrição | Tipo | UN | Peso | Tempo | Desenho | Ações
- [x] Badge colorido por tipo
- [x] Botões: Editar | Excluir
- [x] Loading skeleton
- [x] Empty state
- [x] Error state

### 1.5 - Modal Form
- [x] Criar `components/cadastros/ProdutoFormModal.tsx`
- [x] Dialog shadcn/ui
- [x] Validação manual (sem Zod)
- [x] Campos: código, descrições, tipo, unidade, peso, tempo, desenho
- [x] Gerar código automático ao trocar tipo
- [x] Validações básicas
- [x] Botões: Cancelar, Salvar

### 1.6 - Dialog Exclusão
- [x] Criar `components/cadastros/DeleteProdutoDialog.tsx`
- [x] AlertDialog shadcn/ui
- [x] Mostrar código + descrição
- [x] Aviso: "Esta ação não pode ser desfeita"
- [x] Verificar se está em uso (mock)
- [x] Botões: Cancelar | Excluir
- [x] Click fora NÃO fecha (correto para ação destrutiva)
- [x] Botão vermelho suavizado

### 1.7 - Card (alternativa tabela)
- [x] Criar `components/cadastros/ProdutoCard.tsx`
  - [x] Visual card com informações
  - [x] Hover: botões ação
  - [x] Badge tipo
  - [x] Ícone desenho
- [x] Integrar em ProdutosPage
  - [x] Estado viewMode (table/card)
  - [x] Botões toggle view no header
  - [x] Grid responsivo (1/2/3 colunas)
  - [x] Manter filtros funcionando
  - [x] Hover buttons com opacity

### 1.8 - Registry
- [x] Atualizar `registries/cadastrosRegistry.ts`
  - [x] Adicionar entrada 'produtos-lista'
  - [x] Icon: Package
  - [x] defaultTitle: 'Produtos'
  - [x] component: ProdutosPage
  - [x] category: 'cadastros'

### 1.9 - Testes Manuais
- [x] CRUD completo funcionando
- [x] Filtros funcionando
- [x] Views (tabela/card) funcionando
- [x] Estado UI isolado por aba
- [x] Múltiplas abas independentes
- [ ] Responsividade OK (ajustar no futuro)
- [x] Dark mode OK

---

## 📅 FASE 2 - ESTRUTURAS (BOM)

### 2.1 - Setup e Types BOM
- [x] Criar `types/engenharia/bom.types.ts`
  - [x] Interface `BOMItem`
  - [x] Interface `BOMStructure`
  - [x] Interface `BOMItemFormData`
  - [x] Type `TipoItem`
  - [x] Interface `BOMFilters`

- [x] Criar `data/engenharia/mockBOM.ts`
  - [x] Estrutura hierárquica do Trator (PRD-001)
  - [x] 3 níveis de profundidade
  - [x] Mix de tipos (fabricado, comprado, matéria-prima)

- [x] Criar `stores/engenharia/bomStore.ts`
  - [x] Estado: selectedProdutoId, bomStructure, expandedNodes
  - [x] Actions: loadBOM, clearBOM, toggleNode, expandAll, collapseAll
  - [x] CRUD: addItem, updateItem, deleteItem
  - [x] Funções auxiliares recursivas

### 2.2 - Componente Árvore
- [x] Criar `components/engenharia/BOMTreeNode.tsx`
  - [x] Renderização recursiva
  - [x] Indent visual por nível
  - [x] Ícone expandir/colapsar
  - [x] Mostrar: sequência, código, descrição, tipo, quantidade, unidade
  - [x] Ícones por tipo (fabricado/comprado/matéria-prima)
  - [x] Botões ação no hover

### 2.3 - Página BOM
- [x] Criar `pages/engenharia/BOMPage.tsx`
  - [x] Select produto pai (produtos FABRICADOS)
  - [x] Árvore BOM com renderização recursiva
  - [x] Produto pai destacado (nível 1)
  - [x] Botões: Expandir/Colapsar Tudo, Adicionar Item
  - [x] Loading, Error, Empty states
  - [x] Footer com info estrutura
  - [x] Registry engenhariaRegistry configurado
  - [x] Estado UI isolado por aba (useTabState)


### 2.4 - Página Detalhe BOM
- [x] Criar estrutura relacional mock (mockBOMRelacional.ts)
- [x] Criar `pages/engenharia/BOMPage.tsx`
  - [x] PageHeader com produto pai
  - [x] Seção info produto pai  
  - [x] Cards resumo (componentes, níveis)
  - [x] **Toggle Tree BOM / Flat BOM** (Árvore hierárquica / Lista relacional)
  - [ ] Busca inteligente (Tree: Código+Desc / Flat: Pai/Comp+Desc)
  - [ ] Botão "Adicionar Componente"
  - [x] Expand/Collapse (só Tree)
  - [x] Salvar preferência visualização (localStorage)
  - [x] Componente BOMTreeView (linhas tree, ícones, indentação)
  - [x] Componente BOMFlatView (grid com filtros avançados)
    - [x] Filtros por texto (5 campos)
    - [x] Filtros por checkbox (níveis, unidades)
    - [x] Filtros por range (quantidade)
    - [x] Redimensionamento de colunas
    - [x] Hook useBOMFlatState


### 2.5 - Visualização Árvore
- [ ] Criar `components/engenharia/EstruturaTreeView.tsx`
  - [ ] Componente recursivo
  - [ ] Indentação por nível (visual hierárquico)
  - [ ] Linhas de conexão (CSS)
  - [ ] Ícones por tipo de produto
  - [ ] Expandir/colapsar níveis
  - [ ] Hover: botões ação (Editar | Remover)
  - [ ] Colunas: Ord | Código | Descrição | Qtde | UN | Peso Unit | Peso Total
  - [ ] Totalização no final

### 2.6 - Visualização Lista
- [ ] Criar `components/engenharia/EstruturaListView.tsx`
  - [ ] Tabela plana
  - [ ] Coluna Nível explícita (0, 1, 2, 3...)
  - [ ] Ordenação por: nível ASC, ordem ASC
  - [ ] Indicação visual de profundidade (cor/padding)
  - [ ] Colunas: Nível | Ord | Código | Descrição | Qtde | UN | Peso Unit | Peso Total | Ações
  - [ ] Hover: botões ação

### 2.7 - Modal Adicionar Componente
- [ ] Criar `components/engenharia/AddComponenteModal.tsx`
  - [ ] Dialog shadcn/ui
  - [ ] Select Produto (autocomplete com busca)
  - [ ] Input Quantidade (obrigatório, > 0)
  - [ ] Input Ordenação (sugerida: último + 10)
  - [ ] Select Pai (se estrutura tem componentes)
  - [ ] Preview cálculos (peso total, tempo)
  - [ ] Validação: não permitir produto pai como filho
  - [ ] Validação: não permitir circularidade
  - [ ] Botões: Cancelar | Adicionar

### 2.8 - Modal Editar Componente
- [ ] Criar `components/engenharia/EditComponenteModal.tsx`
  - [ ] Produto readonly (não pode trocar)
  - [ ] Editar: Quantidade, Ordenação, Pai
  - [ ] Preview cálculos atualizados
  - [ ] Validações
  - [ ] Botões: Cancelar | Salvar

### 2.9 - Dialog Remover Componente
- [ ] Criar `components/engenharia/RemoveComponenteDialog.tsx`
  - [ ] AlertDialog shadcn/ui
  - [ ] Mostrar código + descrição
  - [ ] Aviso se tem filhos
  - [ ] Opções: remover só ele | remover cascade (com filhos)
  - [ ] Confirmação
  - [ ] Botões: Cancelar | Remover

### 2.10 - Registry
- [ ] Atualizar `registries/engenhariaRegistry.ts`
  - [ ] Entrada 'estrutura-produtos'
  - [ ] Entrada 'estrutura-produto-detalhe'

### 2.11 - Testes Manuais
- [ ] Criar estrutura simples (1 nível)
- [ ] Criar estrutura complexa (4 níveis)
- [ ] Adicionar componentes
- [ ] Editar componentes (quantidade, ordem)
- [ ] Remover componente sem filhos
- [ ] Remover componente com filhos (cascade)
- [ ] Alternar visualização (árvore/lista)
- [ ] Testar validação circular
- [ ] Verificar cálculos (peso, tempo) recursivos
- [ ] Salvar preferência visualização
- [ ] Testar múltiplas abas

---

## 📅 FASE 3 - DESENHOS

### 3.1 - Setup e Types
- [ ] Criar `types/engenharia/desenho.types.ts`
  - [ ] Interface `Desenho`
  - [ ] Type `TipoArquivo` (PDF | DWG | DXF | STEP | PNG | JPG)
  - [ ] Type `StatusDesenho` (EM_DESENVOLVIMENTO | LIBERADO | OBSOLETO)
  - [ ] Interface `DesenhoFilters`

- [ ] Criar `data/engenharia/mockDesenhos.ts`
  - [ ] Array com desenhos vinculados aos produtos
  - [ ] Mix de tipos de arquivo
  - [ ] Mix de status

### 3.2 - Store Zustand
- [ ] Criar `stores/engenharia/desenhosStore.ts`
  - [ ] Estado: `desenhos`, `desenhoAtual`, `isLoading`, `filters`
  - [ ] Action: `loadDesenhos()`
  - [ ] Action: `uploadDesenho()`
  - [ ] Action: `updateDesenho()`
  - [ ] Action: `deleteDesenho()`
  - [ ] Action: `downloadDesenho()`
  - [ ] Action: `openVisualizador()`
  - [ ] Action: `closeVisualizador()`

### 3.3 - Serviço Upload
- [ ] Criar `services/utils/uploadService.ts`
  - [ ] Função `uploadFile()` (mock com localStorage/base64)
  - [ ] Função `validateFile()` (tipo, tamanho)
  - [ ] Função `generateThumbnail()` (canvas para imagens)
  - [ ] Função `downloadFile()`

### 3.4 - Página Biblioteca
- [ ] Criar `pages/engenharia/BibliotecaDesenhosPage.tsx`
  - [ ] PageHeader: "Biblioteca de Desenhos"
  - [ ] Botão "Upload Desenho"
  - [ ] Filtros: busca, tipo produto, tipo arquivo, status
  - [ ] Toggle: View Grid | View List
  - [ ] Grid de cards (3-4 colunas)
  - [ ] Card: thumbnail, código produto, descrição, tipo arquivo, status, data
  - [ ] Hover: botões (Ver | Download | Info Produto)
  - [ ] Estados (loading, empty, error)

### 3.5 - Componente Thumbnail
- [ ] Criar `components/engenharia/DesenhoThumbnail.tsx`
  - [ ] Lazy loading
  - [ ] Placeholder enquanto carrega
  - [ ] Fallback se erro
  - [ ] Aspect ratio fixo (16:9 ou 4:3)
  - [ ] Ícone por tipo de arquivo (se não é imagem)

### 3.6 - Modal Upload
- [ ] Criar `components/engenharia/UploadDesenhoModal.tsx`
  - [ ] Dialog shadcn/ui
  - [ ] Área drag & drop
  - [ ] Click para selecionar arquivo
  - [ ] Aceitar: .pdf, .dwg, .dxf, .step, .png, .jpg
  - [ ] Validar tamanho (máx 10MB)
  - [ ] Preview arquivo selecionado
  - [ ] Select: Produto vinculado (obrigatório)
  - [ ] Input: Observações
  - [ ] Progress bar upload (mock)
  - [ ] Botões: Cancelar | Upload

### 3.7 - Modal Visualizador
- [ ] Criar `components/engenharia/VisualizadorDesenhoModal.tsx`
  - [ ] Dialog fullscreen
  - [ ] Header: título, tipo, botões (Fechar, Download, Zoom In/Out)
  - [ ] Área visualização central
  - [ ] PDF: iframe ou react-pdf
  - [ ] Imagem: zoom funcional (wheel/pinch)
  - [ ] DWG/DXF/STEP: fallback "Download para visualizar"
  - [ ] Navegação se múltiplos desenhos

### 3.8 - Integração com Produtos
- [ ] Atualizar `pages/cadastros/ProdutosPage.tsx`
  - [ ] Ícone desenho clicável na tabela
  - [ ] Ao clicar: abrir visualizador ou lista de desenhos
  - [ ] Botão "Upload Desenho" no card/row

- [ ] Atualizar `components/cadastros/ProdutoFormModal.tsx`
  - [ ] Seção desenhos vinculados
  - [ ] Botão upload inline

### 3.9 - Registry
- [ ] Atualizar `registries/engenhariaRegistry.ts`
  - [ ] Entrada 'biblioteca-desenhos'

### 3.10 - Testes Manuais
- [ ] Upload PDF
- [ ] Upload imagem (PNG/JPG)
- [ ] Upload DWG/DXF
- [ ] Visualizar PDF
- [ ] Visualizar imagem com zoom
- [ ] Download arquivo
- [ ] Filtrar desenhos (tipo, status, produto)
- [ ] Validar tamanho/tipo arquivo
- [ ] Abrir desenho do produto na listagem
- [ ] Drag & drop funcional

---

## 📅 FASE 4 - CLIENTES + PEDIDOS

### 4.1 - Clientes - Setup
- [ ] Criar `types/cadastros/cliente.types.ts`
  - [ ] Interface `Cliente`
  - [ ] Type `TipoPessoa` (FISICA | JURIDICA)
  - [ ] Interface `ClienteFormData`
  - [ ] Interface `ClienteFilters`

- [ ] Criar `data/cadastros/mockClientes.ts`
  - [ ] Array com 15-20 clientes
  - [ ] Mix PF e PJ

- [ ] Criar `stores/cadastros/clientesStore.ts`
  - [ ] CRUD básico
  - [ ] Validações CNPJ/CPF

### 4.2 - Componentes shadcn/ui
- [ ] Instalar `calendar`
```bash
pnpm dlx shadcn@latest add calendar
```

- [ ] Instalar `date-picker` (ou criar custom)

- [ ] Instalar `radio-group`
```bash
pnpm dlx shadcn@latest add radio-group
```

### 4.3 - Clientes - Página
- [ ] Criar `pages/cadastros/ClientesPage.tsx`
  - [ ] PageHeader: "Clientes"
  - [ ] Botão "Novo Cliente"
  - [ ] Filtros: busca, tipo pessoa
  - [ ] Tabela: Código | Nome/Razão | CPF/CNPJ | Cidade | Telefone | Ações
  - [ ] Badge PF/PJ
  - [ ] Estados (loading, empty, error)

### 4.4 - Clientes - Modal Form
- [ ] Criar `components/cadastros/ClienteFormModal.tsx`
  - [ ] Radio: Tipo Pessoa (PF | PJ)
  - [ ] Input: Razão Social / Nome (obrigatório)
  - [ ] Input: Nome Fantasia (opcional, só PJ)
  - [ ] Input: CNPJ/CPF (validado com biblioteca)
  - [ ] Input: Inscrição Estadual (opcional, só PJ)
  - [ ] Input: Telefone (mask)
  - [ ] Input: Email (validado)
  - [ ] Input: CEP (buscar endereço via API mock)
  - [ ] Input: Logradouro
  - [ ] Input: Número
  - [ ] Input: Complemento
  - [ ] Input: Bairro
  - [ ] Input: Cidade
  - [ ] Select: Estado (UF)
  - [ ] Textarea: Observações
  - [ ] Validações
  - [ ] Botões: Cancelar | Salvar

### 4.5 - Clientes - Dialog Exclusão
- [ ] Criar `components/cadastros/DeleteClienteDialog.tsx`
  - [ ] AlertDialog
  - [ ] Verificar se tem pedidos vinculados
  - [ ] Aviso se tem pedidos
  - [ ] Botões: Cancelar | Excluir

### 4.6 - Pedidos - Setup
- [ ] Criar `types/projetos/pedido.types.ts`
  - [ ] Interface `Pedido`
  - [ ] Type `StatusPedido` (ORCAMENTO | APROVADO | EM_PRODUCAO | CONCLUIDO | CANCELADO)
  - [ ] Interface `PedidoFormData`
  - [ ] Interface `PedidoFilters`

- [ ] Criar `data/projetos/mockPedidos.ts`
  - [ ] Array com 15-20 pedidos
  - [ ] Mix de status
  - [ ] Vincular com clientes e produtos mock

- [ ] Criar `stores/projetos/pedidosStore.ts`
  - [ ] CRUD
  - [ ] Action: `alterarStatus()`
  - [ ] Action: `calcularExplosao()`
  - [ ] Validações de transição de status

### 4.7 - Pedidos - Listagem
- [ ] Criar `pages/projetos/PedidosPage.tsx`
  - [ ] PageHeader: "Pedidos"
  - [ ] Botão "Novo Pedido"
  - [ ] Filtros: busca, status, cliente, período (data início/fim)
  - [ ] Tabela: Número | Cliente | Produto | Qtde | Status | Data | Prazo | Ações
  - [ ] Badge colorido por status
  - [ ] Alerta visual prazo próximo (<7 dias)
  - [ ] Alerta visual atrasado (prazo passado)
  - [ ] Botões: Ver Detalhes | Editar | Alterar Status
  - [ ] Estados (loading, empty, error)

### 4.8 - Pedidos - Modal Form
- [ ] Criar `components/projetos/PedidoFormModal.tsx`
  - [ ] Input: Número (auto: PED-2025-001, readonly)
  - [ ] Select: Cliente (autocomplete com busca)
  - [ ] Select: Produto (autocomplete, só produtos com estrutura)
  - [ ] Input: Quantidade (obrigatório, > 0)
  - [ ] DatePicker: Data Pedido (default hoje)
  - [ ] DatePicker: Data Entrega (obrigatório, >= data pedido)
  - [ ] Select: Status (default ORCAMENTO)
  - [ ] Textarea: Observações
  - [ ] Preview calculado:
    - [ ] Tempo total estimado (horas)
    - [ ] Peso total (kg)
    - [ ] Nº componentes
  - [ ] Validações
  - [ ] Botões: Cancelar | Salvar

### 4.9 - Pedidos - Card (alternativa)
- [ ] Criar `components/projetos/PedidoCard.tsx`
  - [ ] Card visual com info resumida
  - [ ] Badge status
  - [ ] Cliente, produto, qtde
  - [ ] Prazo com countdown
  - [ ] Hover: botões ação

### 4.10 - Pedidos - Detalhe
- [ ] Criar `pages/projetos/PedidoDetalhePage.tsx`
  - [ ] PageHeader com número pedido
  - [ ] Breadcrumbs: "Pedidos > PED-2025-001"
  - [ ] Seção: Dados do Pedido (card)
    - [ ] Cliente (link para cliente)
    - [ ] Produto (link para produto)
    - [ ] Quantidade
    - [ ] Status (badge)
    - [ ] Datas
    - [ ] Observações
  - [ ] Seção: Resumo Técnico (cards)
    - [ ] Tempo total (horas)
    - [ ] Peso total (kg)
    - [ ] Nº componentes totais
    - [ ] Níveis BOM
  - [ ] Seção: Explosão de Materiais (accordion)
    - [ ] Materiais Comprados (tabela)
    - [ ] Materiais Fabricados (tabela)
    - [ ] Matéria-Prima (tabela)
  - [ ] Seção: Histórico de Status (timeline)
  - [ ] Botões header: Editar | Alterar Status | Cancelar Pedido

### 4.11 - Dialog Alterar Status
- [ ] Criar `components/projetos/AlterarStatusDialog.tsx`
  - [ ] Dialog shadcn/ui
  - [ ] Mostrar status atual (badge)
  - [ ] Select novo status (validar transição permitida)
  - [ ] Textarea: Motivo/Observação (obrigatório)
  - [ ] Preview mudanças (se houver)
  - [ ] Botões: Cancelar | Confirmar

### 4.12 - Dialog Cancelar Pedido
- [ ] Criar `components/projetos/DeletePedidoDialog.tsx`
  - [ ] AlertDialog
  - [ ] Aviso: "Pedido será marcado como CANCELADO"
  - [ ] Textarea: Motivo cancelamento (obrigatório)
  - [ ] Verificar se está em produção
  - [ ] Botões: Voltar | Cancelar Pedido

### 4.13 - Registry
- [ ] Atualizar `registries/cadastrosRegistry.ts`
  - [ ] Entrada 'cadastro-clientes'

- [ ] Atualizar `registries/projetosRegistry.ts`
  - [ ] Entrada 'pedidos'
  - [ ] Entrada 'pedido-detalhe'

### 4.14 - Testes Manuais
- [ ] Criar cliente PF
- [ ] Criar cliente PJ
- [ ] Validar CNPJ/CPF
- [ ] Criar pedido
- [ ] Editar pedido
- [ ] Alterar status (todas transições)
- [ ] Cancelar pedido
- [ ] Ver explosão no detalhe
- [ ] Testar filtros pedidos
- [ ] Testar alertas de prazo
- [ ] Verificar cálculos automáticos

---

## 📅 FASE 5 - EXPLOSÃO + RELATÓRIOS

### 5.1 - Serviço Explosão
- [ ] Criar `services/utils/explosaoMateriaisService.ts`
  - [ ] Função `calcularExplosao()` (recursiva)
    - [ ] Input: produtoId, quantidade
    - [ ] Output: array de materiais consolidados
    - [ ] Algoritmo recursivo multinível
    - [ ] Totalizar itens duplicados
    - [ ] Multiplicar quantidades por nível
  - [ ] Função `agruparPorTipo()`
  - [ ] Função `calcularPesoTotal()`
  - [ ] Função `calcularTempoTotal()`
  - [ ] Função `gerarNumeracaoNivel()` (0, 1, 2, 3...)

### 5.2 - Página Relatório
- [ ] Criar `pages/relatorios/ExplosaoMateriaisPage.tsx`
  - [ ] PageHeader: "Explosão de Materiais"
  - [ ] Seção Seleção Origem:
    - [ ] Radio: "Pedido Existente" | "Produto + Quantidade Manual"
    - [ ] Se Pedido: Select pedido (autocomplete)
    - [ ] Se Manual: Select produto + Input quantidade
  - [ ] Botão: "Gerar Relatório" (primary, large)
  - [ ] Seção Resultado:
    - [ ] Cards Resumo (4 cards)
      - [ ] Total Itens Únicos
      - [ ] Peso Total (kg)
      - [ ] Tempo Total (horas)
      - [ ] Níveis BOM
    - [ ] Accordions por Tipo (3 accordions)
      - [ ] Materiais Comprados (expandido default)
      - [ ] Materiais Fabricados
      - [ ] Matéria-Prima
    - [ ] Cada accordion: tabela com dados
  - [ ] Filtros Visualização:
    - [ ] Toggle: "Apenas Comprados"
    - [ ] Toggle: "Apenas Fabricados"
    - [ ] Toggle: "Apenas Matéria-Prima"
  - [ ] Seção Exportação:
    - [ ] Botão: "Exportar PDF" (mock alert)
    - [ ] Botão: "Exportar Excel" (mock alert)
    - [ ] Botão: "Copiar Lista" (clipboard)
  - [ ] Estados (loading, empty, error)

### 5.3 - Componente Tabela
- [ ] Criar `components/relatorios/TabelaMateriaisExplosao.tsx`
  - [ ] Props: `materiais`, `tipo`
  - [ ] Tabela responsiva
  - [ ] Colunas: Código | Descrição | Qtde Total | UN | Peso Unit | Peso Total
  - [ ] Row hover
  - [ ] Click row: sheet lateral com detalhes produto
  - [ ] Footer: totalização (qtde, peso)
  - [ ] Ordenação (clicável nos headers)

### 5.4 - Registry
- [ ] Criar `registries/relatoriosRegistry.ts`
  - [ ] Entrada 'explosao-materiais'
  - [ ] Icon: Calculator

- [ ] Atualizar `registries/index.ts`
  - [ ] Importar e exportar relatoriosRegistry

### 5.5 - Testes Manuais
- [ ] Gerar relatório de pedido existente
- [ ] Gerar relatório manual (produto + qty)
- [ ] Verificar totalização recursiva (níveis)
- [ ] Verificar agrupamento de itens duplicados
- [ ] Testar filtros (comprados, fabricados, matéria-prima)
- [ ] Testar acordeões (expandir/colapsar)
- [ ] Copiar lista (clipboard)
- [ ] Verificar cálculos de peso e tempo
- [ ] Testar com estrutura simples (1 nível)
- [ ] Testar com estrutura complexa (4 níveis)

---

## 📅 FASE 6 - POLIMENTO GERAL

### 6.1 - Components Shared
- [ ] Criar `components/shared/EmptyState.tsx`
  - [ ] Props: `icon`, `title`, `description`, `action` (botão)
  - [ ] Layout centralizado
  - [ ] Ícone grande (lucide-react)
  - [ ] Mensagem clara
  - [ ] Botão ação sugerida (opcional)

- [ ] Criar `components/shared/LoadingState.tsx`
  - [ ] Props: `message` (opcional)
  - [ ] Spinner animado
  - [ ] Skeleton loader (opcional)
  - [ ] Mensagem customizável

- [ ] Criar `components/shared/ErrorState.tsx`
  - [ ] Props: `error`, `onRetry`
  - [ ] Ícone de erro
  - [ ] Mensagem de erro
  - [ ] Botão "Tentar novamente"
  - [ ] Botão "Voltar" (opcional)

### 6.2 - Aplicar Estados em Todas Páginas
- [ ] ProdutosPage: loading, empty, error
- [ ] ClientesPage: loading, empty, error
- [ ] EstruturasPage: loading, empty, error
- [ ] EstruturaDetalhePage: loading, error
- [ ] BibliotecaDesenhosPage: loading, empty, error
- [ ] PedidosPage: loading, empty, error
- [ ] PedidoDetalhePage: loading, error
- [ ] ExplosaoMateriaisPage: loading, empty, error

### 6.3 - Responsividade
- [ ] Testar todas páginas em mobile (375px)
- [ ] Testar todas páginas em tablet (768px)
- [ ] Testar todas páginas em desktop (1024px+)
- [ ] Ajustar tabelas (scroll horizontal em mobile)
- [ ] Ajustar modais (largura adaptativa)
- [ ] Ajustar cards (grid responsivo)
- [ ] Ajustar filtros (stack vertical em mobile)

### 6.4 - Dark Mode
- [ ] Verificar todas páginas no dark mode
- [ ] Ajustar cores de badges
- [ ] Ajustar contraste de textos
- [ ] Ajustar bordas/separadores
- [ ] Ajustar sombras
- [ ] Testar transição light/dark

### 6.5 - Toasts e Feedback
- [ ] Adicionar toasts em todas ações CRUD
  - [ ] Sucesso: verde, ícone check
  - [ ] Erro: vermelho, ícone x
  - [ ] Info: azul, ícone info
  - [ ] Warning: amarelo, ícone alert
- [ ] Tempo adequado (3-5s)
- [ ] Posição consistente (top-right)
- [ ] Dismiss manual (X)

### 6.6 - Validações
- [ ] Testar todas validações de formulários
- [ ] Mensagens de erro claras e específicas
- [ ] Highlights em campos inválidos (borda vermelha)
- [ ] Desabilitar submit enquanto inválido
- [ ] Validação em tempo real (onChange)
- [ ] Validação final (onSubmit)

### 6.7 - Performance
- [ ] Verificar lazy loading de imagens
- [ ] Verificar lazy loading de componentes (React.lazy)
- [ ] Verificar re-renders desnecessários (React DevTools)
- [ ] Otimizar listas grandes (virtualização se >100 itens)
- [ ] Otimizar filtros (debounce em buscas)
- [ ] Code splitting (routes automático TanStack)

### 6.8 - UX
- [ ] Breadcrumbs em todas páginas
- [ ] Tooltips em ícones/botões (hover 500ms)
- [ ] Confirmação antes de deletar (sempre)
- [ ] Loading durante operações assíncronas
- [ ] Indicador de campo obrigatório (*)
- [ ] Placeholder útil em inputs
- [ ] Labels descritivos
- [ ] Ordem de foco lógica (Tab)

### 6.9 - Acessibilidade Básica
- [ ] Alt text em imagens
- [ ] Aria-label em ícones
- [ ] Contraste mínimo (WCAG AA)
- [ ] Navegação por teclado funcional
- [ ] Focus visível
- [ ] Roles semânticos

### 6.10 - Checklist Final MVP Frontend
- [ ] ✅ CRUD Produtos funciona
- [ ] ✅ BOM árvore/lista funciona
- [ ] ✅ Upload desenhos funciona
- [ ] ✅ Visualizador desenhos funciona
- [ ] ✅ CRUD Clientes funciona
- [ ] ✅ Lançamento pedidos funciona
- [ ] ✅ Explosão materiais funciona
- [ ] ✅ Relatório exportável funciona
- [ ] ✅ Dark mode funciona
- [ ] ✅ Responsivo funciona
- [ ] ✅ Validações funcionam
- [ ] ✅ Toasts funcionam
- [ ] ✅ Estados (loading, empty, error) funcionam

---

## ⚡ **ATÉ AQUI É O MVP FRONTEND (MOCK DATA)**

---

## 📅 FASE 7 - INTEGRAÇÃO BACKEND

### 7.1 - Setup API Client
- [ ] Criar `types/shared/api.types.ts`
  - [ ] Interface `ApiResponse<T>`
  - [ ] Interface `ApiError`
  - [ ] Interface `PaginatedResponse<T>`
  - [ ] Type `HttpMethod`

- [ ] Criar `services/api/apiClient.ts`
  - [ ] Axios instance configurado
  - [ ] Base URL (env variable)
  - [ ] Interceptors (request: auth token)
  - [ ] Interceptors (response: error handling)
  - [ ] Refresh token logic
  - [ ] Timeout configuration

### 7.2 - Services de API
- [ ] Criar `services/api/produtosService.ts`
  - [ ] `getProdutos(filters)` → GET /api/produtos
  - [ ] `getProdutoById(id)` → GET /api/produtos/:id
  - [ ] `createProduto(data)` → POST /api/produtos
  - [ ] `updateProduto(id, data)` → PUT /api/produtos/:id
  - [ ] `deleteProduto(id)` → DELETE /api/produtos/:id

- [ ] Criar `services/api/clientesService.ts`
  - [ ] `getClientes(filters)` → GET /api/clientes
  - [ ] `getClienteById(id)` → GET /api/clientes/:id
  - [ ] `createCliente(data)` → POST /api/clientes
  - [ ] `updateCliente(id, data)` → PUT /api/clientes/:id
  - [ ] `deleteCliente(id)` → DELETE /api/clientes/:id

- [ ] Criar `services/api/estruturasService.ts`
  - [ ] `getEstruturas(filters)` → GET /api/estruturas
  - [ ] `getEstruturaById(id)` → GET /api/estruturas/:id
  - [ ] `createEstrutura(data)` → POST /api/estruturas
  - [ ] `addComponente(estruturaId, data)` → POST /api/estruturas/:id/componentes
  - [ ] `updateComponente(estruturaId, compId, data)` → PUT /api/estruturas/:id/componentes/:compId
  - [ ] `removeComponente(estruturaId, compId)` → DELETE /api/estruturas/:id/componentes/:compId

- [ ] Criar `services/api/desenhosService.ts`
  - [ ] `getDesenhos(filters)` → GET /api/desenhos
  - [ ] `getDesenhoById(id)` → GET /api/desenhos/:id
  - [ ] `uploadDesenho(file, metadata)` → POST /api/desenhos (multipart)
  - [ ] `downloadDesenho(id)` → GET /api/desenhos/:id/download
  - [ ] `deleteDesenho(id)` → DELETE /api/desenhos/:id

- [ ] Criar `services/api/pedidosService.ts`
  - [ ] `getPedidos(filters)` → GET /api/pedidos
  - [ ] `getPedidoById(id)` → GET /api/pedidos/:id
  - [ ] `createPedido(data)` → POST /api/pedidos
  - [ ] `updatePedido(id, data)` → PUT /api/pedidos/:id
  - [ ] `alterarStatus(id, status, motivo)` → PATCH /api/pedidos/:id/status
  - [ ] `cancelarPedido(id, motivo)` → PATCH /api/pedidos/:id/cancelar
  - [ ] `getExplosao(id)` → GET /api/pedidos/:id/explosao

### 7.3 - Atualizar Stores (Trocar Mock por API)
- [ ] Atualizar `stores/cadastros/produtosStore.ts`
  - [ ] `loadProdutos()` → chamar `produtosService.getProdutos()`
  - [ ] `createProduto()` → chamar `produtosService.createProduto()`
  - [ ] `updateProduto()` → chamar `produtosService.updateProduto()`
  - [ ] `deleteProduto()` → chamar `produtosService.deleteProduto()`
  - [ ] Tratar erros
  - [ ] Atualizar isLoading/error

- [ ] Atualizar `stores/cadastros/clientesStore.ts`
  - [ ] Seguir mesmo padrão produtos

- [ ] Atualizar `stores/engenharia/estruturasStore.ts`
  - [ ] `loadEstruturas()` → chamar API
  - [ ] `addComponente()` → chamar API
  - [ ] `updateComponente()` → chamar API
  - [ ] `removeComponente()` → chamar API

- [ ] Atualizar `stores/engenharia/desenhosStore.ts`
  - [ ] `loadDesenhos()` → chamar API
  - [ ] `uploadDesenho()` → chamar API (multipart)
  - [ ] `downloadDesenho()` → chamar API

- [ ] Atualizar `stores/projetos/pedidosStore.ts`
  - [ ] `loadPedidos()` → chamar API
  - [ ] `createPedido()` → chamar API
  - [ ] `updatePedido()` → chamar API
  - [ ] `alterarStatus()` → chamar API
  - [ ] `cancelarPedido()` → chamar API
  - [ ] `calcularExplosao()` → chamar API

### 7.4 - Autenticação Real
- [ ] Atualizar `stores/authStore.ts`
  - [ ] `login()` → POST /api/auth/login (retorna JWT)
  - [ ] `logout()` → POST /api/auth/logout
  - [ ] `refreshToken()` → POST /api/auth/refresh
  - [ ] Salvar token em localStorage
  - [ ] Validar token expirado

- [ ] Atualizar `pages/auth/LoginPage.tsx`
  - [ ] Integrar com authStore real
  - [ ] Tratar erros de autenticação
  - [ ] Redirect após login

- [ ] Proteger rotas
  - [ ] `routes/__root.tsx` → verificar token válido
  - [ ] Redirect para login se não autenticado

### 7.5 - Error Handling Global
- [ ] Criar `components/shared/ErrorBoundary.tsx`
  - [ ] Capturar erros React
  - [ ] UI de erro amigável
  - [ ] Botão "Reportar erro"

- [ ] Tratamento de erros API
  - [ ] 401 Unauthorized → redirect login
  - [ ] 403 Forbidden → mensagem "Sem permissão"
  - [ ] 404 Not Found → mensagem específica
  - [ ] 500 Server Error → mensagem "Erro no servidor"
  - [ ] Network Error → mensagem "Sem conexão"

### 7.6 - Variáveis de Ambiente
- [ ] Criar `.env.example`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000
```

- [ ] Criar `.env.development`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

- [ ] Criar `.env.production`
```env
VITE_API_BASE_URL=https://api.arjsys.com.br/api
```

- [ ] Adicionar `.env` ao `.gitignore`

### 7.7 - Testes de Integração
- [ ] Testar login com backend real
- [ ] Testar CRUD produtos com backend
- [ ] Testar CRUD clientes com backend
- [ ] Testar estruturas com backend
- [ ] Testar upload desenhos com backend
- [ ] Testar pedidos com backend
- [ ] Testar explosão materiais com backend
- [ ] Testar tratamento de erros (401, 403, 404, 500)
- [ ] Testar refresh token
- [ ] Testar logout

---

## 📅 FASE 8 - DASHBOARD + KANBAN

### 8.1 - Dashboard - Setup
- [ ] Instalar recharts
```bash
pnpm add recharts
```

- [ ] Criar stores para métricas
  - [ ] `dashboardStore.ts` → carregar métricas

### 8.2 - Dashboard - Página
- [ ] Criar `pages/DashboardPage.tsx`
  - [ ] PageHeader: "Dashboard"
  - [ ] Grid de Cards Métricas (2x2)
    - [ ] Total Pedidos Ativos
    - [ ] Pedidos Atrasados
    - [ ] Valor Total (R$)
    - [ ] Taxa Conclusão (%)
  - [ ] Seção Gráficos (2 colunas)
    - [ ] Gráfico Pedidos por Status (pizza)
    - [ ] Gráfico Pedidos por Mês (linha)
  - [ ] Seção Últimos Pedidos (tabela resumida)
  - [ ] Seção Alertas (cards)
    - [ ] Pedidos próximos do prazo
    - [ ] Materiais em falta
  - [ ] Atalhos Rápidos (botões)
    - [ ] Novo Pedido
    - [ ] Novo Produto
    - [ ] Ver Estruturas
    - [ ] Relatório Materiais

### 8.3 - Kanban - Setup
- [ ] Instalar @dnd-kit (drag and drop)
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] Criar `types/projetos/kanban.types.ts`
  - [ ] Interface `KanbanColumn`
  - [ ] Interface `KanbanCard`

- [ ] Criar `stores/projetos/kanbanStore.ts`
  - [ ] Estado: `columns`, `cards`
  - [ ] Action: `moveCard()`
  - [ ] Action: `updateCardStatus()`

### 8.4 - Kanban - Componentes
- [ ] Criar `components/projetos/PedidoKanbanCard.tsx`
  - [ ] Card arrastável
  - [ ] Número pedido
  - [ ] Cliente
  - [ ] Produto
  - [ ] Prazo (badge colorido)
  - [ ] Avatar responsável (mock)

### 8.5 - Kanban - Página
- [ ] Criar `pages/projetos/KanbanPage.tsx`
  - [ ] PageHeader: "Kanban de Pedidos"
  - [ ] Filtros: cliente, produto, responsável
  - [ ] 5 Colunas drag & drop:
    - [ ] Orçamento (cinza)
    - [ ] Aprovado (azul)
    - [ ] Em Produção (amarelo)
    - [ ] Concluído (verde)
    - [ ] Cancelado (vermelho)
  - [ ] Contador de cards por coluna
  - [ ] Drag & drop funcional
  - [ ] Atualizar status ao soltar

### 8.6 - Funcionários (básico)
- [ ] Criar `types/cadastros/funcionario.types.ts`
  - [ ] Interface `Funcionario`
  - [ ] Type `Cargo`

- [ ] Criar `data/cadastros/mockFuncionarios.ts`
  - [ ] 10-15 funcionários

- [ ] Criar `stores/cadastros/funcionariosStore.ts`
  - [ ] CRUD básico

- [ ] Criar `pages/cadastros/FuncionariosPage.tsx`
  - [ ] CRUD simples (similar produtos/clientes)

### 8.7 - Registry
- [ ] Atualizar `registries/cadastrosRegistry.ts`
  - [ ] Entrada 'cadastro-funcionarios'

- [ ] Atualizar `registries/projetosRegistry.ts`
  - [ ] Entrada 'kanban-pedidos'

### 8.8 - Testes
- [ ] Visualizar dashboard com dados
- [ ] Testar gráficos (responsivos)
- [ ] Testar kanban drag & drop
- [ ] Mover cards entre colunas
- [ ] Verificar atualização de status
- [ ] CRUD funcionários

---

## 📅 FASE 9 - NECESSIDADES DE COMPRAS + RELATÓRIOS

### 9.1 - Necessidades de Compras - Setup
- [ ] Criar types para compras
- [ ] Criar store para necessidades
- [ ] Lógica: gerar lista de comprados da explosão

### 9.2 - Necessidades de Compras - Página
- [ ] Criar `pages/compras/NecessidadesComprasPage.tsx`
  - [ ] Select pedido ou múltiplos pedidos
  - [ ] Botão "Gerar Necessidades"
  - [ ] Tabela: Código | Descrição | Qtde Necessária | UN | Fornecedor Sugerido
  - [ ] Agrupar itens iguais
  - [ ] Marcar como "Pedido" ou "Já Comprado"
  - [ ] Exportar lista

### 9.3 - Relatório Consolidado
- [ ] Criar `pages/relatorios/RelatorioConsolidadoPage.tsx`
  - [ ] Selecionar período
  - [ ] Selecionar filtros (cliente, produto, status)
  - [ ] Gerar relatório multi-seção:
    - [ ] Resumo pedidos
    - [ ] Materiais mais usados
    - [ ] Tempo médio produção
    - [ ] Peso médio
  - [ ] Exportar PDF/Excel

### 9.4 - Registry
- [ ] Atualizar `registries/comprasRegistry.ts`
  - [ ] Entrada 'necessidades-compras'

- [ ] Atualizar `registries/relatoriosRegistry.ts`
  - [ ] Entrada 'relatorio-consolidado'

---

## 📅 FASE 10 - PRODUÇÃO + ALMOXARIFADO

### 10.1 - Almoxarifado
- [ ] Criar types (estoque, movimentação)
- [ ] Criar stores
- [ ] Páginas:
  - [ ] SaldoEstoquePage
  - [ ] EntradaMaterialPage
  - [ ] SaidaMaterialPage
  - [ ] ReservaProjetoPage

### 10.2 - Produção
- [ ] Criar types (ordem produção, apontamento)
- [ ] Criar stores
- [ ] Páginas:
  - [ ] FilaProducaoPage
  - [ ] KanbanProducaoPage (similar kanban pedidos)
  - [ ] ApontamentoPage

### 10.3 - Compras Avançado
- [ ] SolicitacoesCompraPage
- [ ] StatusComprasPage
- [ ] Fluxo aprovação (mock)

### 10.4 - Registry
- [ ] Criar `registries/almoxarifadoRegistry.ts`
- [ ] Atualizar `registries/producaoRegistry.ts`
- [ ] Atualizar `registries/comprasRegistry.ts`

---

## 📅 FASE 11 - QUALIDADE + ADMIN + AVANÇADOS

### 11.1 - Qualidade
- [ ] Criar types (inspeção, não conformidade)
- [ ] Criar stores
- [ ] Páginas:
  - [ ] InspecaoPage
  - [ ] AprovacaoPage
  - [ ] NaoConformidadePage

### 11.2 - Administração
- [ ] Páginas:
  - [ ] UsuariosPage (CRUD)
  - [ ] PerfisAcessoPage (permissões)
  - [ ] LogsSistemaPage (auditoria)

### 11.3 - Engenharia Avançado
- [ ] RevisaoDesenhoPage (controle revisão A, B, C)
- [ ] WhereUsedPage (onde item é usado)
- [ ] Lógica recursiva where-used

### 11.4 - Projetos Avançado
- [ ] CronogramaPage (gantt simples)
- [ ] Número de série por pedido
- [ ] Rastreabilidade

### 11.5 - Registry
- [ ] Criar `registries/qualidadeRegistry.ts`
- [ ] Criar `registries/adminRegistry.ts`
- [ ] Atualizar `registries/engenhariaRegistry.ts`
- [ ] Atualizar `registries/projetosRegistry.ts`

---

## ✅ CHECKLIST GERAL COMPLETO

### MVP Frontend (FASES 1-6)
- [ ] ✅ 9 páginas funcionais
- [ ] ✅ 5 stores Zustand
- [ ] ✅ 9 arquivos de types
- [ ] ✅ 5 arquivos mock data
- [ ] ✅ ~25 componentes novos
- [ ] ✅ 4 registries atualizados

### Integração Backend (FASE 7)
- [ ] ✅ API client configurado
- [ ] ✅ 5 services de API
- [ ] ✅ Stores usando API real
- [ ] ✅ Autenticação JWT
- [ ] ✅ Error handling global

### Expansão (FASES 8-11)
- [ ] ✅ Dashboard com métricas
- [ ] ✅ Kanban drag & drop
- [ ] ✅ Necessidades de compras
- [ ] ✅ Almoxarifado
- [ ] ✅ Produção
- [ ] ✅ Qualidade
- [ ] ✅ Admin
- [ ] ✅ Where-used
- [ ] ✅ Revisões desenho

---

