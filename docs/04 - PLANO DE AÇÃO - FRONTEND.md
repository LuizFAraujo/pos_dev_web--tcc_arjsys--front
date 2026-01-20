<!-- markdownlint-disable-file -->
# 📋 PLANO DE AÇÃO - FRONTEND (Implementação Real do Sistema)

**Objetivo:** Desenvolver MVP funcional do ERP ARJSYS para apresentação de TCC
**Prazo estimado:** 10-12 semanas
**Foco principal:** Gestão de Projetos/Desenhos + Estrutura de Produtos (BOM)

---

## 🎯 ESTRATÉGIA DE PRIORIZAÇÃO

### Modelo MoSCoW

**MUST (Essencial para TCC):**
- Cadastro de Produtos/Códigos
- Estrutura de Produtos (BOM)
- Visualizador de Desenhos
- Pedidos/Projetos
- Cálculo de Materiais (explosão BOM)

**SHOULD (Importante):**
- Cadastro de Clientes
- Kanban de Projetos
- Dashboard básico

**COULD (Desejável):**
- Cadastro de Funcionários
- Necessidades de Compras
- Relatórios avançados

**WON'T (Próximas versões):**
- Cronograma Gantt
- Módulo Financeiro
- Gestão de Estoque completa
- BI/Dashboards avançados

---

## 📊 CRONOGRAMA GERAL

| Semana | Fase | Entregas |
|--------|------|----------|
| 1-2 | Fase 1.1 | Cadastro de Produtos completo |
| 3-4 | Fase 1.2 | Estrutura de Produtos (BOM) |
| 4-5 | Fase 1.3 | Visualizador de Desenhos |
| 5-6 | Fase 2.1 | Cadastro Clientes + Pedidos |
| 6-7 | Fase 2.2 | Explosão Materiais + Relatórios |
| 7-8 | Fase 2.3 | Kanban de Projetos |
| 9 | Fase 3 | Dashboard + Polimento |
| 10 | Fase 4 | Páginas Futuras + Docs |

---

## 🚀 FASE 1 - CADASTROS BASE + ENGENHARIA (Semanas 1-5)

---

### 📦 FASE 1.1 - Cadastro de Produtos (Semanas 1-2) ⭐ MUST

#### **Objetivo:** Sistema completo de CRUD de produtos com validações e upload de desenhos

---

#### 1.1.1 - Setup Inicial
- [ ] Criar types em `src/types/produto.types.ts`
  - [ ] Interface `Produto`
  - [ ] Interface `ProdutoFormData`
  - [ ] Type `TipoProduto` ('FABRICADO' | 'COMPRADO' | 'MATERIA_PRIMA')
  - [ ] Type `UnidadeMedida` ('UN' | 'KG' | 'M' | 'M2' | 'M3' | 'L')
  - [ ] Type `ProdutoFilters`

- [ ] Criar mock data em `src/data/mockProdutos.ts`
  - [ ] Criar array com 10-15 produtos de exemplo
  - [ ] Incluir mix de tipos (fabricados, comprados, matéria-prima)
  - [ ] Alguns com desenho, outros sem

- [ ] Criar store em `src/stores/produtosStore.ts`
  - [ ] Estado: `produtos`, `isLoading`, `error`, `filters`
  - [ ] Actions: `loadProdutos`, `createProduto`, `updateProduto`, `deleteProduto`
  - [ ] Actions: `setFilters`, `clearFilters`
  - [ ] Função auxiliar: `generateCodigo()` (auto incremento)

---

#### 1.1.2 - Página de Listagem
- [ ] Criar `src/pages/cadastros/ProdutosPage.tsx`
  - [ ] Estrutura base com PageWrapper
  - [ ] PageHeader com título "Produtos" e botão "Novo Produto"
  - [ ] Breadcrumbs: "Cadastros > Produtos"

- [ ] Implementar filtros (barra superior)
  - [ ] Campo de busca (código ou descrição)
  - [ ] Select tipo (Todos, Fabricado, Comprado, Matéria-Prima)
  - [ ] Select possui desenho (Todos, Sim, Não)
  - [ ] Botão "Limpar Filtros"

- [ ] Criar tabela de listagem
  - [ ] Colunas: Código | Descrição | Tipo | UN | Peso | Tempo Fab | Desenho | Ações
  - [ ] Ordenação clicável por código/descrição
  - [ ] Indicador visual de tipo (badge colorido)
  - [ ] Ícone de desenho (FileText quando possui)
  - [ ] Hover mostra tooltip com descrição completa
  - [ ] Botões de ação: Editar (Pencil) | Excluir (Trash2)

- [ ] Implementar paginação
  - [ ] Componente de paginação (shadcn/ui)
  - [ ] Itens por página: 10, 25, 50
  - [ ] Navegação anterior/próxima
  - [ ] Ir para página específica

- [ ] Estados da página
  - [ ] Loading skeleton enquanto carrega
  - [ ] Empty state quando não há produtos
  - [ ] Empty state quando busca não retorna resultados
  - [ ] Error state com retry

---

#### 1.1.3 - Modal de Cadastro/Edição
- [ ] Criar `src/components/cadastros/ProdutoFormModal.tsx`
  - [ ] Dialog do shadcn/ui como base
  - [ ] Título dinâmico: "Novo Produto" ou "Editar Produto"
  - [ ] Modo create/edit baseado em prop `produto?: Produto`

- [ ] Implementar formulário com React Hook Form
  - [ ] Setup validação com Zod schema
  - [ ] Campo: Código (auto gerado, desabilitado em edição)
  - [ ] Campo: Descrição Curta (obrigatório, max 100 chars)
  - [ ] Campo: Descrição Completa (textarea, opcional, max 500 chars)
  - [ ] Select: Tipo (obrigatório, radio group visual)
  - [ ] Select: Unidade de Medida (obrigatório)
  - [ ] Input: Peso Estimado (number, opcional, kg, min 0)
  - [ ] Input: Tempo de Fabricação (number, opcional, horas, min 0)
  - [ ] Checkbox: Possui Desenho?
  - [ ] Upload: Arquivo de Desenho (quando checkbox marcado)

- [ ] Implementar upload de desenho
  - [ ] Área de drop (drag and drop)
  - [ ] Click para selecionar arquivo
  - [ ] Aceitar: .pdf, .dwg, .dxf, .png, .jpg
  - [ ] Validar tamanho máximo (10MB)
  - [ ] Preview do arquivo (nome + tamanho)
  - [ ] Botão remover arquivo selecionado
  - [ ] Progress bar durante upload (simulado ou real)

- [ ] Validações
  - [ ] Código único (verificar duplicatas)
  - [ ] Descrição curta obrigatória
  - [ ] Tipo obrigatório
  - [ ] Unidade obrigatória
  - [ ] Peso >= 0
  - [ ] Tempo >= 0
  - [ ] Desenho obrigatório se checkbox marcado

- [ ] Ações do formulário
  - [ ] Botão "Cancelar" (fecha modal, confirma se há alterações)
  - [ ] Botão "Salvar" (disabled enquanto inválido)
  - [ ] Loading state durante submit
  - [ ] Success toast após salvar
  - [ ] Error toast se falhar
  - [ ] Fechar modal após sucesso

---

#### 1.1.4 - Dialog de Confirmação de Exclusão
- [ ] Criar `src/components/cadastros/DeleteProdutoDialog.tsx`
  - [ ] AlertDialog do shadcn/ui
  - [ ] Mostrar código e descrição do produto
  - [ ] Aviso: "Esta ação não pode ser desfeita"
  - [ ] Verificar se produto está em uso (estruturas, pedidos)
  - [ ] Se em uso: mostrar alerta e bloquear exclusão
  - [ ] Botões: "Cancelar" | "Excluir" (vermelho, destructive)

- [ ] Implementar lógica de exclusão
  - [ ] Chamar action do store
  - [ ] Loading state durante exclusão
  - [ ] Success toast
  - [ ] Error toast se falhar
  - [ ] Fechar dialog após sucesso
  - [ ] Atualizar lista de produtos

---

#### 1.1.5 - Detalhes do Produto (Quick View)
- [ ] Criar `src/components/cadastros/ProdutoDetailsSheet.tsx`
  - [ ] Sheet lateral (direita) do shadcn/ui
  - [ ] Abrir ao clicar na linha da tabela
  - [ ] Mostrar todas as informações do produto
  - [ ] Seção de dados principais
  - [ ] Seção de medidas (peso, tempo)
  - [ ] Seção de desenho (se houver)
  - [ ] Preview do desenho (thumbnail)
  - [ ] Botão "Ver Desenho" (abre visualizador)
  - [ ] Botão "Editar" (abre modal de edição)
  - [ ] Botão "Excluir" (abre dialog de confirmação)

---

#### 1.1.6 - Integração com Backend (API)
- [ ] Criar service em `src/services/produtosService.ts`
  - [ ] `getProdutos(filters?)` - GET /api/produtos
  - [ ] `getProdutoById(id)` - GET /api/produtos/:id
  - [ ] `createProduto(data)` - POST /api/produtos
  - [ ] `updateProduto(id, data)` - PUT /api/produtos/:id
  - [ ] `deleteProduto(id)` - DELETE /api/produtos/:id
  - [ ] `uploadDesenho(id, file)` - POST /api/produtos/:id/upload-desenho
  - [ ] `getDesenhoUrl(id)` - GET /api/produtos/:id/desenho

- [ ] Atualizar store para usar service real
  - [ ] Substituir mock por chamadas API
  - [ ] Tratamento de erros
  - [ ] Loading states
  - [ ] Retry logic (opcional)

- [ ] Implementar upload real de arquivos
  - [ ] FormData para envio
  - [ ] Progress tracking
  - [ ] Cancelar upload (opcional)

---

#### 1.1.7 - Testes e Validação
- [ ] Testar CRUD completo
  - [ ] Criar produto fabricado
  - [ ] Criar produto comprado
  - [ ] Criar produto matéria-prima
  - [ ] Editar produto existente
  - [ ] Deletar produto não usado
  - [ ] Tentar deletar produto em uso (deve bloquear)

- [ ] Testar validações
  - [ ] Código duplicado
  - [ ] Campos obrigatórios vazios
  - [ ] Peso negativo
  - [ ] Tempo negativo
  - [ ] Upload de arquivo muito grande
  - [ ] Upload de tipo não permitido

- [ ] Testar filtros e busca
  - [ ] Buscar por código
  - [ ] Buscar por descrição
  - [ ] Filtrar por tipo
  - [ ] Filtrar por possui desenho
  - [ ] Combinar múltiplos filtros
  - [ ] Limpar filtros

- [ ] Testar paginação
  - [ ] Navegar entre páginas
  - [ ] Mudar itens por página
  - [ ] Ir para página específica

- [ ] Testar responsividade
  - [ ] Desktop (>1024px)
  - [ ] Tablet (768-1024px)
  - [ ] Mobile (<768px)

---

#### 1.1.8 - Registry e Navegação
- [ ] Adicionar ao registry `src/registries/cadastrosRegistry.ts`
  - [ ] Criar entrada 'cadastro-produtos'
  - [ ] Icon: Package
  - [ ] defaultTitle: 'Produtos'
  - [ ] category: 'cadastros'

- [ ] Testar abertura via sidebar
  - [ ] Click na sidebar abre aba
  - [ ] Múltiplas abas da mesma página
  - [ ] Estado isolado entre abas

---

### 🏗️ FASE 1.2 - Estrutura de Produtos (BOM) (Semanas 3-4) ⭐ MUST

#### **Objetivo:** Sistema completo de montagem e visualização de estrutura de produtos hierárquica

---

#### 1.2.1 - Setup Inicial
- [ ] Criar types em `src/types/estrutura.types.ts`
  - [ ] Interface `EstruturaProduto`
  - [ ] Interface `ComponenteBOM`
  - [ ] Interface `EstruturaProdutoFormData`
  - [ ] Type `VisualizacaoMode` ('tree' | 'list')
  - [ ] Interface `NivelEstrutura` (para cálculos recursivos)

- [ ] Criar mock data em `src/data/mockEstruturas.ts`
  - [ ] 3-5 estruturas de exemplo
  - [ ] Estrutura simples (1 nível)
  - [ ] Estrutura média (2-3 níveis)
  - [ ] Estrutura complexa (4+ níveis)
  - [ ] Incluir diferentes tipos de componentes

- [ ] Criar store em `src/stores/estruturasStore.ts`
  - [ ] Estado: `estruturas`, `estruturaAtual`, `isLoading`, `error`
  - [ ] Estado: `visualizacaoMode` (salvar no localStorage)
  - [ ] Actions: `loadEstruturas`, `loadEstruturaPorProduto`
  - [ ] Actions: `createEstrutura`, `updateEstrutura`, `deleteEstrutura`
  - [ ] Actions: `addComponente`, `updateComponente`, `removeComponente`
  - [ ] Actions: `setVisualizacaoMode`
  - [ ] Função: `calcularNiveis()` (recursiva)
  - [ ] Função: `calcularPesoTotal()`
  - [ ] Função: `calcularTempoTotal()`

---

#### 1.2.2 - Página de Listagem de Estruturas
- [ ] Criar `src/pages/engenharia/EstruturasPage.tsx`
  - [ ] Estrutura base com PageWrapper
  - [ ] PageHeader com título "Estruturas de Produtos"
  - [ ] Breadcrumbs: "Engenharia > Estruturas"
  - [ ] Botão "Nova Estrutura"

- [ ] Implementar listagem de estruturas
  - [ ] Cards com produto principal
  - [ ] Mostrar código + descrição do produto pai
  - [ ] Indicadores: quantidade de componentes, níveis
  - [ ] Badge com peso total
  - [ ] Badge com tempo total estimado
  - [ ] Botões: Ver Detalhes | Editar | Excluir

- [ ] Implementar busca
  - [ ] Buscar por código do produto pai
  - [ ] Buscar por descrição do produto pai
  - [ ] Filtrar por tipo de produto

- [ ] Estados da página
  - [ ] Loading skeleton
  - [ ] Empty state
  - [ ] Error state

---

#### 1.2.3 - Página de Detalhes/Edição da Estrutura
- [ ] Criar `src/pages/engenharia/EstruturaDetalhePage.tsx`
  - [ ] Aceitar ID da estrutura via params
  - [ ] PageHeader com produto pai
  - [ ] Breadcrumbs: "Engenharia > Estruturas > [Nome Produto]"

- [ ] Seção de informações do produto pai
  - [ ] Código, Descrição
  - [ ] Tipo, Unidade, Peso
  - [ ] Tempo de fabricação
  - [ ] Possui desenho (link se tiver)

- [ ] Toggle de modo de visualização
  - [ ] Switch: "Árvore" | "Lista"
  - [ ] Ícones: TreePine | List
  - [ ] Salvar preferência no localStorage
  - [ ] Transição suave entre modos

- [ ] Botão "Adicionar Componente"
  - [ ] Abre modal de adição
  - [ ] Sempre visível (sticky no topo)

---

#### 1.2.4 - Visualização em Árvore (Tree Mode)
- [ ] Criar componente `src/components/engenharia/EstruturaTreeView.tsx`
  - [ ] Componente recursivo para renderizar árvore
  - [ ] Indentação visual por nível (padding-left)
  - [ ] Linhas de conexão (bordas CSS)
  - [ ] Ícones por tipo de produto
  - [ ] Ícone de desenho quando possui

- [ ] Item da árvore
  - [ ] Mostrar: Ordenação | Código | Descrição | Qtde | UN
  - [ ] Peso unitário e total
  - [ ] Badges visuais (tipo, desenho)
  - [ ] Hover: destaque e botões de ação
  - [ ] Botões: Editar | Excluir | Ver Desenho

- [ ] Interatividade
  - [ ] Expandir/colapsar subníveis
  - [ ] Ícone de seta (ChevronRight com rotate)
  - [ ] Estado de expansão persistente (localStorage)
  - [ ] Botão "Expandir Tudo" / "Colapsar Tudo"

- [ ] Exemplo visual:
  ```
  📦 TRATOR AGRÍCOLA (PRD-001) [1 UN]
    ├─ 0010 🔧 CHASSI PRINCIPAL (PRD-100) [2 UN] ▼
    │   ├─ 0010 ⚙️ VIGA LATERAL ESQ (PRD-110) [1 UN]
    │   └─ 0020 ⚙️ VIGA LATERAL DIR (PRD-111) [1 UN]
    ├─ 0020 🔩 ROLAMENTO SKF UC-200 (CMP-050) [4 UN] 📄
    └─ 0030 ⚡ MOTOR DIESEL (CMP-200) [1 UN]
  ```

---

#### 1.2.5 - Visualização em Lista (List Mode)
- [ ] Criar componente `src/components/engenharia/EstruturaListView.tsx`
  - [ ] Tabela plana com todos os componentes
  - [ ] Coluna "Nível" explícita (0, 1, 2, 3...)
  - [ ] Ordenação por nível + ordenação

- [ ] Colunas da tabela
  - [ ] Nível
  - [ ] Ordenação
  - [ ] Código
  - [ ] Descrição
  - [ ] Quantidade
  - [ ] Unidade
  - [ ] Peso Unit
  - [ ] Peso Total
  - [ ] Desenho
  - [ ] Ações

- [ ] Indicação visual de nível
  - [ ] Cor de fundo alternada por nível
  - [ ] Indentação no código ou descrição
  - [ ] Ícone de profundidade

- [ ] Ordenação
  - [ ] Click no header para ordenar
  - [ ] Ordenação por nível + ordenação (padrão)
  - [ ] Ordenação por código
  - [ ] Ordenação por descrição

- [ ] Exemplo visual (tabela):
  ```
  | Nível | Ord. | Código  | Descrição         | Qtde | UN | Peso U | Peso T | Desenho | Ações |
  |-------|------|---------|-------------------|------|----|--------|--------|---------|-------|
  |   0   |  -   | PRD-001 | TRATOR AGRÍCOLA   |  1   | UN | 2500kg | 2500kg |   ✅    | [...]  |
  |   1   | 0010 | PRD-100 | CHASSI PRINCIPAL  |  2   | UN |  800kg | 1600kg |   ✅    | [...]  |
  |   2   | 0010 | PRD-110 | VIGA LATERAL ESQ  |  1   | UN |  150kg |  150kg |   ✅    | [...]  |
  |   2   | 0020 | PRD-111 | VIGA LATERAL DIR  |  1   | UN |  150kg |  150kg |   ✅    | [...]  |
  |   1   | 0020 | CMP-050 | ROLAMENTO SKF     |  4   | UN |    2kg |    8kg |   ✅    | [...]  |
  |   1   | 0030 | CMP-200 | MOTOR DIESEL      |  1   | UN |  300kg |  300kg |   ❌    | [...]  |
  ```

---

#### 1.2.6 - Modal de Adicionar Componente
- [ ] Criar `src/components/engenharia/AddComponenteModal.tsx`
  - [ ] Dialog do shadcn/ui
  - [ ] Título: "Adicionar Componente"

- [ ] Formulário
  - [ ] Select: Produto (autocomplete com todos os produtos)
    - [ ] Buscar por código ou descrição
    - [ ] Mostrar tipo do produto (badge)
    - [ ] Preview de dados (peso, tempo, UN)
    - [ ] Bloquear seleção do próprio produto pai (circular)
  - [ ] Input: Quantidade (obrigatório, > 0)
  - [ ] Input: Ordenação (auto sugerida: último + 10)
    - [ ] Ex: se último é 0020, sugerir 0030
    - [ ] Permitir edição manual
  - [ ] Select: Nível (se estrutura já tem componentes)
    - [ ] Nível 1 (filho direto do pai)
    - [ ] Nível 2 (filho de componente nível 1)
    - [ ] Mostrar apenas níveis válidos

- [ ] Preview de cálculos
  - [ ] Peso total: quantidade × peso unitário
  - [ ] Unidade (herdada do produto)
  - [ ] Tempo total (se aplicável)

- [ ] Validações
  - [ ] Produto obrigatório
  - [ ] Quantidade > 0
  - [ ] Ordenação no formato correto (0010, 0020, etc)
  - [ ] Não permitir duplicata (mesmo produto + mesmo nível + mesma ordenação)

- [ ] Ações
  - [ ] Botão "Cancelar"
  - [ ] Botão "Adicionar"
  - [ ] Success toast
  - [ ] Atualizar visualização (tree ou list)

---

#### 1.2.7 - Modal de Editar Componente
- [ ] Criar `src/components/engenharia/EditComponenteModal.tsx`
  - [ ] Similar ao adicionar
  - [ ] Título: "Editar Componente"
  - [ ] Produto não pode ser alterado (mostrar como readonly)

- [ ] Campos editáveis
  - [ ] Quantidade
  - [ ] Ordenação
  - [ ] Nível (com cuidado para não quebrar hierarquia)

- [ ] Validações
  - [ ] Quantidade > 0
  - [ ] Ordenação válida
  - [ ] Nível válido

- [ ] Ações
  - [ ] Botão "Cancelar"
  - [ ] Botão "Salvar"
  - [ ] Success toast
  - [ ] Atualizar visualização

---

#### 1.2.8 - Dialog de Remover Componente
- [ ] Criar `src/components/engenharia/RemoveComponenteDialog.tsx`
  - [ ] AlertDialog
  - [ ] Mostrar código + descrição do componente
  - [ ] Aviso se componente tem filhos
  - [ ] Opções:
    - [ ] Remover apenas este componente (filhos sobem de nível)
    - [ ] Remover componente e todos os filhos (cascade)

- [ ] Ações
  - [ ] Botão "Cancelar"
  - [ ] Botão "Remover" (vermelho)
  - [ ] Success toast
  - [ ] Atualizar visualização

---

#### 1.2.9 - Cálculos Automáticos
- [ ] Implementar função `calcularNiveis()`
  - [ ] Algoritmo recursivo
  - [ ] Atribuir nível correto a cada componente
  - [ ] Atualizar estrutura completa

- [ ] Implementar função `calcularPesoTotal()`
  - [ ] Somar peso de todos os componentes
  - [ ] Considerar quantidade de cada item
  - [ ] Recursivo (filhos × quantidade pai)

- [ ] Implementar função `calcularTempoTotal()`
  - [ ] Somar tempo de fabricação
  - [ ] Considerar apenas itens fabricados
  - [ ] Recursivo

- [ ] Implementar função `validarCircular()`
  - [ ] Detectar referências circulares
  - [ ] Bloquear antes de salvar
  - [ ] Exemplo: PRD-001 → PRD-002 → PRD-001 (ERRO!)

---

#### 1.2.10 - Integração com Backend
- [ ] Criar service `src/services/estruturasService.ts`
  - [ ] `getEstruturas()` - GET /api/estruturas
  - [ ] `getEstruturaPorProduto(produtoId)` - GET /api/estruturas/produto/:produtoId
  - [ ] `createEstrutura(data)` - POST /api/estruturas
  - [ ] `updateEstrutura(id, data)` - PUT /api/estruturas/:id
  - [ ] `deleteEstrutura(id)` - DELETE /api/estruturas/:id
  - [ ] `addComponente(estruturaId, data)` - POST /api/estruturas/:id/componentes
  - [ ] `updateComponente(estruturaId, componenteId, data)` - PUT /api/estruturas/:id/componentes/:componenteId
  - [ ] `removeComponente(estruturaId, componenteId)` - DELETE /api/estruturas/:id/componentes/:componenteId

- [ ] Atualizar store
  - [ ] Usar service real
  - [ ] Tratamento de erros
  - [ ] Loading states

---

#### 1.2.11 - Testes e Validação
- [ ] Testar estrutura simples (1 nível)
  - [ ] Adicionar componentes
  - [ ] Editar componentes
  - [ ] Remover componentes
  - [ ] Verificar cálculos

- [ ] Testar estrutura complexa (4+ níveis)
  - [ ] Adicionar componentes em vários níveis
  - [ ] Editar componentes mantendo hierarquia
  - [ ] Remover componentes com filhos
  - [ ] Verificar cálculos recursivos

- [ ] Testar modos de visualização
  - [ ] Alternar entre tree e list
  - [ ] Verificar persistência da preferência
  - [ ] Expandir/colapsar na árvore
  - [ ] Ordenar na lista

- [ ] Testar validações
  - [ ] Bloquear referência circular
  - [ ] Bloquear quantidade zero/negativa
  - [ ] Bloquear ordenação duplicada no mesmo nível
  - [ ] Validar formato de ordenação

- [ ] Testar responsividade
  - [ ] Desktop (árvore e lista)
  - [ ] Tablet (talvez só lista)
  - [ ] Mobile (lista compacta)

---

#### 1.2.12 - Registry e Navegação
- [ ] Adicionar ao registry `src/registries/engenhariaRegistry.ts`
  - [ ] Criar entrada 'estrutura-produtos'
  - [ ] Icon: Network
  - [ ] defaultTitle: 'Estrutura de Produtos'
  - [ ] category: 'engenharia'

- [ ] Adicionar entrada para detalhe
  - [ ] 'estrutura-produto-detalhe'
  - [ ] Abertura com parâmetro de ID
  - [ ] Título dinâmico com nome do produto

---

### 📄 FASE 1.3 - Visualizador de Desenhos (Semanas 4-5) ⭐ MUST

#### **Objetivo:** Biblioteca de desenhos com visualizador e gerenciamento de arquivos técnicos

---

#### 1.3.1 - Setup Inicial
- [ ] Criar types em `src/types/desenho.types.ts`
  - [ ] Interface `Desenho`
  - [ ] Interface `DesenhoMetadata`
  - [ ] Type `TipoArquivo` ('PDF' | 'DWG' | 'DXF' | 'PNG' | 'JPG')
  - [ ] Interface `DesenhoFilters`

- [ ] Criar store em `src/stores/desenhosStore.ts`
  - [ ] Estado: `desenhos`, `desenhoAtual`, `isLoading`
  - [ ] Estado: `filters`, `visualizadorOpen`
  - [ ] Actions: `loadDesenhos`, `openVisualizador`, `closeVisualizador`
  - [ ] Actions: `setFilters`, `downloadDesenho`

---

#### 1.3.2 - Página Biblioteca de Desenhos
- [ ] Criar `src/pages/engenharia/BibliotecaDesenhosPage.tsx`
  - [ ] Estrutura base com PageWrapper
  - [ ] PageHeader com título "Biblioteca de Desenhos"
  - [ ] Breadcrumbs: "Engenharia > Desenhos"

- [ ] Implementar filtros
  - [ ] Campo de busca (código ou descrição)
  - [ ] Select tipo de produto
  - [ ] Select tipo de arquivo
  - [ ] Checkbox: "Apenas desenhos recentes"

- [ ] Visualização em grid de cards
  - [ ] Layout responsivo (3-4 colunas desktop)
  - [ ] Card por desenho
  - [ ] Thumbnail do desenho
  - [ ] Código do produto
  - [ ] Descrição
  - [ ] Badge com tipo de arquivo
  - [ ] Data de upload
  - [ ] Hover: botões de ação

- [ ] Ações nos cards
  - [ ] Botão "Ver Desenho" (Eye)
  - [ ] Botão "Download" (Download)
  - [ ] Botão "Detalhes do Produto" (Info)

- [ ] Estados da página
  - [ ] Loading skeleton (grid)
  - [ ] Empty state
  - [ ] Error state

---

#### 1.3.3 - Geração de Thumbnails
- [ ] Implementar service de thumbnails
  - [ ] PDF → Imagem primeira página
  - [ ] PNG/JPG → Resize proporcionalmente
  - [ ] DWG/DXF → Placeholder com ícone

- [ ] Componente de thumbnail
  - [ ] `src/components/engenharia/DesenhoThumbnail.tsx`
  - [ ] Lazy loading de imagens
  - [ ] Placeholder enquanto carrega
  - [ ] Fallback se erro
  - [ ] Aspect ratio fixo (16:9 ou 4:3)

---

#### 1.3.4 - Modal Visualizador de Desenhos
- [ ] Criar `src/components/engenharia/VisualizadorDesenhoModal.tsx`
  - [ ] Dialog fullscreen
  - [ ] Header com título e botões
  - [ ] Área de visualização central
  - [ ] Sidebar com informações (opcional)

- [ ] Header do visualizador
  - [ ] Título: código + descrição do produto
  - [ ] Botão "Fechar" (X)
  - [ ] Botão "Download"
  - [ ] Botão "Zoom In" (+)
  - [ ] Botão "Zoom Out" (-)
  - [ ] Botão "Reset Zoom" (Maximize2)

- [ ] Implementar visualizador de PDF
  - [ ] Usar lib: `react-pdf` ou similar
  - [ ] Navegação de páginas
  - [ ] Zoom funcional
  - [ ] Busca de texto (opcional)

- [ ] Implementar visualizador de imagens
  - [ ] PNG/JPG com zoom
  - [ ] Drag para mover quando zoomed
  - [ ] Pinch to zoom (mobile)

- [ ] Implementar preview DWG/DXF
  - [ ] Opção 1: Conversão backend para imagem
  - [ ] Opção 2: Lib de viewer específica
  - [ ] Fallback: Download direto com mensagem

- [ ] Sidebar de informações (toggle)
  - [ ] Dados do produto
  - [ ] Tipo de arquivo
  - [ ] Tamanho do arquivo
  - [ ] Data de upload
  - [ ] Dimensões (se imagem)
  - [ ] Número de páginas (se PDF)

---

#### 1.3.5 - Integração com Upload (já feito em Produtos)
- [ ] Verificar integração
  - [ ] Upload em Produtos adiciona à biblioteca
  - [ ] Atualizar desenho atualiza biblioteca
  - [ ] Deletar produto com desenho atualiza biblioteca

---

#### 1.3.6 - Download de Desenhos
- [ ] Implementar download
  - [ ] Botão download no card
  - [ ] Botão download no visualizador
  - [ ] Gerar nome do arquivo: `[codigo]_[descricao].[ext]`
  - [ ] Progress durante download (se grande)

- [ ] Download em lote (opcional)
  - [ ] Checkbox nos cards
  - [ ] Botão "Baixar Selecionados"
  - [ ] Gerar ZIP com selecionados

---

#### 1.3.7 - Integração com Backend
- [ ] Criar service `src/services/desenhosService.ts`
  - [ ] `getDesenhos(filters?)` - GET /api/desenhos
  - [ ] `getDesenhoById(id)` - GET /api/desenhos/:id
  - [ ] `getDesenhoArquivo(id)` - GET /api/desenhos/:id/arquivo
  - [ ] `getDesenhoThumbnail(id)` - GET /api/desenhos/:id/thumbnail
  - [ ] `downloadDesenho(id)` - GET /api/desenhos/:id/download

- [ ] Atualizar store
  - [ ] Usar service real
  - [ ] Cache de thumbnails
  - [ ] Tratamento de erros

---

#### 1.3.8 - Testes e Validação
- [ ] Testar biblioteca
  - [ ] Carregar desenhos
  - [ ] Filtrar por código
  - [ ] Filtrar por tipo
  - [ ] Buscar desenho específico

- [ ] Testar visualizador
  - [ ] Abrir PDF (várias páginas)
  - [ ] Abrir imagem PNG/JPG
  - [ ] Testar zoom in/out/reset
  - [ ] Navegar páginas PDF
  - [ ] Download de arquivo

- [ ] Testar upload (via Produtos)
  - [ ] Upload PDF
  - [ ] Upload imagem
  - [ ] Upload DWG/DXF
  - [ ] Validar tamanho máximo
  - [ ] Validar tipo de arquivo

- [ ] Testar responsividade
  - [ ] Grid de cards em diferentes telas
  - [ ] Visualizador em mobile
  - [ ] Zoom/pinch em mobile

---

#### 1.3.9 - Registry e Navegação
- [ ] Adicionar ao registry `src/registries/engenhariaRegistry.ts`
  - [ ] Criar entrada 'biblioteca-desenhos'
  - [ ] Icon: FileText
  - [ ] defaultTitle: 'Biblioteca de Desenhos'
  - [ ] category: 'engenharia'

---

## 🚀 FASE 2 - PROJETOS + RELATÓRIOS (Semanas 5-8)

---

### 👥 FASE 2.1 - Cadastro de Clientes + Pedidos (Semanas 5-6)

#### **Objetivo:** Cadastro de clientes e lançamento de pedidos/projetos

---

#### 2.1.1 - Cadastro de Clientes (Simplificado)
- [ ] Criar types `src/types/cliente.types.ts`
  - [ ] Interface `Cliente`
  - [ ] Interface `ClienteFormData`
  - [ ] Type `TipoPessoa` ('FISICA' | 'JURIDICA')

- [ ] Criar store `src/stores/clientesStore.ts`
  - [ ] Estado: `clientes`, `isLoading`, `error`
  - [ ] Actions: CRUD básico

- [ ] Criar página `src/pages/cadastros/ClientesPage.tsx`
  - [ ] Listagem com tabela
  - [ ] Filtros: busca, tipo
  - [ ] Modal de cadastro/edição
  - [ ] Dialog de exclusão

- [ ] Formulário de cliente
  - [ ] Tipo Pessoa (radio: Física | Jurídica)
  - [ ] Razão Social / Nome (obrigatório)
  - [ ] Nome Fantasia (opcional)
  - [ ] CNPJ/CPF (validado, obrigatório)
  - [ ] Telefone
  - [ ] Email
  - [ ] Endereço (opcional)
  - [ ] Cidade, Estado

- [ ] Validações
  - [ ] CNPJ/CPF válido
  - [ ] Email válido
  - [ ] Telefone válido

- [ ] Registry
  - [ ] Adicionar 'cadastro-clientes' ao cadastrosRegistry
  - [ ] Icon: Users
  - [ ] Testar navegação

---

#### 2.1.2 - Pedidos/Projetos - Setup
- [ ] Criar types `src/types/pedido.types.ts`
  - [ ] Interface `Pedido`
  - [ ] Interface `PedidoFormData`
  - [ ] Type `StatusPedido` ('ORCAMENTO' | 'APROVADO' | 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO')
  - [ ] Interface `ExplosaoMaterial`

- [ ] Criar store `src/stores/pedidosStore.ts`
  - [ ] Estado: `pedidos`, `pedidoAtual`, `isLoading`
  - [ ] Actions: CRUD
  - [ ] Actions: `alterarStatus`, `calcularExplosao`

---

#### 2.1.3 - Página de Listagem de Pedidos
- [ ] Criar `src/pages/projetos/PedidosPage.tsx`
  - [ ] PageHeader com "Pedidos" e botão "Novo Pedido"
  - [ ] Breadcrumbs: "Projetos > Pedidos"

- [ ] Filtros
  - [ ] Busca por número/cliente
  - [ ] Select status
  - [ ] Select cliente
  - [ ] Range de datas

- [ ] Tabela de pedidos
  - [ ] Colunas: Número | Cliente | Produto | Qtde | Status | Prazo | Ações
  - [ ] Badge colorido por status
  - [ ] Alerta se prazo próximo (<7 dias)
  - [ ] Ordenação por data/status
  - [ ] Paginação

- [ ] Ações
  - [ ] Ver Detalhes
  - [ ] Editar (se não concluído)
  - [ ] Alterar Status
  - [ ] Cancelar

---

#### 2.1.4 - Modal de Novo Pedido
- [ ] Criar `src/components/projetos/PedidoFormModal.tsx`
  - [ ] Dialog largo
  - [ ] Título: "Novo Pedido" / "Editar Pedido"

- [ ] Formulário
  - [ ] Número do pedido (auto gerado: PED-2025-001)
  - [ ] Select Cliente (autocomplete)
  - [ ] Select Produto Principal (autocomplete, só com estrutura)
  - [ ] Input Quantidade (obrigatório, > 0)
  - [ ] Date Picker: Data de Entrega (obrigatório, futura)
  - [ ] Select Status (padrão: ORCAMENTO)
  - [ ] Textarea Observações (opcional)

- [ ] Preview de cálculos (ao selecionar produto)
  - [ ] Tempo total estimado
  - [ ] Peso total estimado
  - [ ] Número de componentes

- [ ] Validações
  - [ ] Cliente obrigatório
  - [ ] Produto obrigatório (e com estrutura)
  - [ ] Quantidade > 0
  - [ ] Data futura

- [ ] Ações
  - [ ] Cancelar
  - [ ] Salvar
  - [ ] Salvar e Ver Detalhes

---

#### 2.1.5 - Página de Detalhes do Pedido
- [ ] Criar `src/pages/projetos/PedidoDetalhePage.tsx`
  - [ ] Aceitar ID via params
  - [ ] PageHeader com número do pedido
  - [ ] Breadcrumbs: "Projetos > Pedidos > [Número]"

- [ ] Seção: Dados do Pedido
  - [ ] Número, Status (badge)
  - [ ] Cliente (com link para detalhes)
  - [ ] Produto principal
  - [ ] Quantidade
  - [ ] Data lançamento
  - [ ] Data entrega prevista
  - [ ] Observações

- [ ] Seção: Resumo do Projeto
  - [ ] Cards com métricas
  - [ ] Tempo total de produção
  - [ ] Peso total
  - [ ] Número de componentes únicos
  - [ ] Custo estimado (opcional)

- [ ] Seção: Explosão de Materiais
  - [ ] Tabela com materiais necessários
  - [ ] Agrupado por tipo (Fabricado, Comprado, Matéria-Prima)
  - [ ] Colunas: Código | Descrição | Qtde Total | UN | Tipo
  - [ ] Totalização por tipo
  - [ ] Botão "Exportar Lista"

- [ ] Seção: Andamento (opcional - Fase 2.3)
  - [ ] Kanban inline
  - [ ] Timeline

- [ ] Botões de ação
  - [ ] Editar Pedido
  - [ ] Alterar Status
  - [ ] Cancelar Pedido
  - [ ] Gerar Relatório PDF

---

#### 2.1.6 - Dialog de Alterar Status
- [ ] Criar `src/components/projetos/AlterarStatusDialog.tsx`
  - [ ] AlertDialog
  - [ ] Mostrar status atual
  - [ ] Select novo status
  - [ ] Validar transição (ex: não pode voltar de CONCLUÍDO)
  - [ ] Textarea: Motivo (opcional)

- [ ] Ações
  - [ ] Cancelar
  - [ ] Confirmar
  - [ ] Success toast
  - [ ] Atualizar pedido

---

#### 2.1.7 - Integração com Backend
- [ ] Service `src/services/pedidosService.ts`
  - [ ] CRUD completo
  - [ ] `alterarStatus(id, status)`
  - [ ] `calcularExplosao(id)`

- [ ] Atualizar store
  - [ ] Usar service real
  - [ ] Tratamento de erros

---

#### 2.1.8 - Testes
- [ ] Criar pedido completo
- [ ] Editar pedido
- [ ] Alterar status (fluxo completo)
- [ ] Ver explosão de materiais
- [ ] Cancelar pedido
- [ ] Filtros e busca

---

#### 2.1.9 - Registry
- [ ] `cadastro-clientes` (cadastrosRegistry)
- [ ] `pedidos` (projetosRegistry - criar!)
- [ ] `pedido-detalhe` (dinâmico)

---

### 📊 FASE 2.2 - Explosão de Materiais + Relatórios (Semanas 6-7)

#### **Objetivo:** Cálculo automático de materiais e geração de relatórios

---

#### 2.2.1 - Serviço de Explosão de Materiais
- [ ] Implementar `src/services/explosaoMateriaisService.ts`
  - [ ] Função recursiva para explodir BOM
  - [ ] Considerar quantidade do pedido
  - [ ] Totalizar materiais repetidos
  - [ ] Agrupar por tipo
  - [ ] Calcular peso total
  - [ ] Calcular tempo total

- [ ] Algoritmo
  - [ ] Input: Produto + Quantidade
  - [ ] Buscar estrutura do produto
  - [ ] Para cada componente:
    - [ ] Multiplicar quantidade × qtde pedido
    - [ ] Se componente tem estrutura: recursão
    - [ ] Acumular no resultado
  - [ ] Totalizar itens duplicados
  - [ ] Ordenar por tipo + código

- [ ] Exemplo de saída:
  ```typescript
  {
    materiaisComprados: [
      { codigo: 'CMP-050', descricao: 'ROLAMENTO SKF', qtde: 20, un: 'UN' },
      { codigo: 'CMP-200', descricao: 'MOTOR DIESEL', qtde: 5, un: 'UN' }
    ],
    materiaisFabricados: [
      { codigo: 'PRD-100', descricao: 'CHASSI', qtde: 10, un: 'UN' },
      { codigo: 'PRD-110', descricao: 'VIGA ESQ', qtde: 10, un: 'UN' }
    ],
    materiasPrimas: [...],
    resumo: {
      pesoTotal: 12500,
      tempoTotal: 320,
      totalItens: 35
    }
  }
  ```

---

#### 2.2.2 - Página de Relatório de Materiais
- [ ] Criar `src/pages/relatorios/ExplosaoMateriaisPage.tsx`
  - [ ] PageHeader: "Relatório de Materiais"
  - [ ] Breadcrumbs: "Relatórios > Explosão de Materiais"

- [ ] Seleção de origem
  - [ ] Radio Group:
    - [ ] Pedido Existente
    - [ ] Produto + Quantidade Manual
  - [ ] Se Pedido: Select pedido
  - [ ] Se Manual: Select produto + Input quantidade

- [ ] Botão "Gerar Relatório"
  - [ ] Chama serviço de explosão
  - [ ] Loading durante cálculo
  - [ ] Exibe resultado abaixo

- [ ] Exibição do resultado
  - [ ] Cards de resumo (total itens, peso, tempo)
  - [ ] Accordions por tipo:
    - [ ] Materiais Comprados
    - [ ] Materiais Fabricados
    - [ ] Matérias-Primas
  - [ ] Tabela dentro de cada accordion
  - [ ] Totalização por tipo

- [ ] Filtros de visualização
  - [ ] Toggle: "Apenas Comprados" (para orçamento fornecedor)
  - [ ] Toggle: "Apenas Fabricados" (para ordem produção)
  - [ ] Toggle: "Agrupar por Fornecedor" (se tiver)

- [ ] Exportação
  - [ ] Botão "Exportar PDF"
  - [ ] Botão "Exportar Excel"
  - [ ] Botão "Copiar Lista" (clipboard)

---

#### 2.2.3 - Componente de Tabela de Materiais
- [ ] Criar `src/components/relatorios/TabelaMateriaisExplosao.tsx`
  - [ ] Recebe array de materiais
  - [ ] Colunas: Código | Descrição | Qtde | UN | Peso Unit | Peso Total
  - [ ] Row com hover
  - [ ] Click abre detalhes do produto (sheet)
  - [ ] Totalização no footer

---

#### 2.2.4 - Exportação PDF
- [ ] Implementar geração de PDF
  - [ ] Lib: `jspdf` ou `react-pdf`
  - [ ] Template profissional
  - [ ] Header: Logo ARJSYS + data
  - [ ] Título: "Relatório de Materiais"
  - [ ] Dados do pedido (se aplicável)
  - [ ] Tabelas por tipo
  - [ ] Totalizações
  - [ ] Footer: página X de Y

---

#### 2.2.5 - Exportação Excel
- [ ] Implementar geração de Excel
  - [ ] Lib: `xlsx` ou `exceljs`
  - [ ] Abas por tipo de material
  - [ ] Formatação de células
  - [ ] Totalizações
  - [ ] Larguras de coluna automáticas

---

#### 2.2.6 - Integração com Backend
- [ ] Service `src/services/explosaoMateriaisService.ts`
  - [ ] `calcularExplosao(pedidoId?, produtoId?, quantidade?)`
  - [ ] Retorna dados completos

- [ ] Atualizar store
  - [ ] Usar service real
  - [ ] Cache de resultados (opcional)

---

#### 2.2.7 - Testes
- [ ] Gerar relatório de pedido existente
- [ ] Gerar relatório manual (produto + qtde)
- [ ] Verificar totalização
- [ ] Testar filtros (apenas comprados, apenas fabricados)
- [ ] Exportar PDF
- [ ] Exportar Excel
- [ ] Copiar lista

---

#### 2.2.8 - Registry
- [ ] Adicionar 'explosao-materiais' ao relatoriosRegistry
- [ ] Icon: Calculator
- [ ] Testar navegação

---

### 🎯 FASE 2.3 - Kanban de Projetos (Semanas 7-8)

#### **Objetivo:** Visualização e gestão de pedidos em formato Kanban

---

#### 2.3.1 - Setup Kanban
- [ ] Instalar lib de drag & drop
  - [ ] `@dnd-kit/core`
  - [ ] `@dnd-kit/sortable`
  - [ ] `@dnd-kit/utilities`

- [ ] Criar types `src/types/kanban.types.ts`
  - [ ] Interface `KanbanColumn`
  - [ ] Interface `KanbanCard`

---

#### 2.3.2 - Página Kanban
- [ ] Criar `src/pages/projetos/KanbanProjetosPage.tsx`
  - [ ] PageHeader: "Kanban de Projetos"
  - [ ] Breadcrumbs: "Projetos > Kanban"
  - [ ] Layout horizontal scrollável

- [ ] Colunas do Kanban
  - [ ] ORÇAMENTO (amarelo)
  - [ ] APROVADO (azul)
  - [ ] EM PRODUÇÃO (laranja)
  - [ ] CONCLUÍDO (verde)

- [ ] Estrutura de coluna
  - [ ] Header: Título + contador de cards
  - [ ] Área de drop (droppable)
  - [ ] Lista de cards (sortable)
  - [ ] Empty state quando vazio

---

#### 2.3.3 - Card do Pedido
- [ ] Criar `src/components/projetos/PedidoKanbanCard.tsx`
  - [ ] Draggable
  - [ ] Número do pedido (header)
  - [ ] Cliente
  - [ ] Produto principal
  - [ ] Quantidade
  - [ ] Prazo de entrega
  - [ ] Badge de status
  - [ ] Indicador de prazo (verde/amarelo/vermelho)
  - [ ] Click abre detalhes

- [ ] Estilo visual
  - [ ] Borda colorida por status
  - [ ] Sombra ao arrastar
  - [ ] Hover: elevar
  - [ ] Compacto mas informativo

---

#### 2.3.4 - Drag & Drop
- [ ] Implementar lógica de DnD
  - [ ] DndContext wrapper
  - [ ] Sensors (mouse, touch, keyboard)
  - [ ] Handler onDragEnd
  - [ ] Atualizar status do pedido ao mover
  - [ ] Otimistic update (atualiza UI antes da API)
  - [ ] Rollback se falhar

- [ ] Validações
  - [ ] Não permitir mover CONCLUÍDO para outras colunas
  - [ ] Confirmar mudança de APROVADO para ORÇAMENTO
  - [ ] Toast de sucesso ao mover

---

#### 2.3.5 - Filtros do Kanban
- [ ] Filtro por cliente
  - [ ] Select múltiplo
  - [ ] Mostrar apenas pedidos dos clientes selecionados

- [ ] Filtro por produto
  - [ ] Select múltiplo
  - [ ] Filtrar por tipo de produto

- [ ] Filtro por prazo
  - [ ] Range de datas
  - [ ] Preset: "Próximos 7 dias", "Próximos 30 dias"

---

#### 2.3.6 - Indicadores Visuais
- [ ] Cores de urgência
  - [ ] Verde: prazo > 14 dias
  - [ ] Amarelo: prazo 7-14 dias
  - [ ] Vermelho: prazo < 7 dias
  - [ ] Cinza: atrasado

- [ ] Ícones extras
  - [ ] 📄 Possui desenho
  - [ ] ⚠️ Observação importante
  - [ ] 💬 Comentários (opcional)

---

#### 2.3.7 - Quick Actions
- [ ] Menu de contexto no card (botão ⋮)
  - [ ] Ver Detalhes
  - [ ] Editar Pedido
  - [ ] Alterar Status (manual)
  - [ ] Cancelar Pedido
  - [ ] Adicionar Comentário (opcional)

---

#### 2.3.8 - Integração com Backend
- [ ] Usar pedidosService existente
  - [ ] `alterarStatus(id, novoStatus)`
  - [ ] Atualizar store após mudança

---

#### 2.3.9 - Testes
- [ ] Arrastar card entre colunas
- [ ] Verificar atualização de status
- [ ] Testar validações de movimentação
- [ ] Filtrar pedidos
- [ ] Quick actions nos cards
- [ ] Responsividade (mobile: lista ao invés de kanban?)

---

#### 2.3.10 - Registry
- [ ] Adicionar 'kanban-projetos' ao projetosRegistry
- [ ] Icon: LayoutBoard
- [ ] Testar navegação

---

## 🎨 FASE 3 - MELHORIAS & POLIMENTO (Semana 9)

---

### 📊 FASE 3.1 - Dashboard Inicial

#### **Objetivo:** Página inicial com resumo e atalhos

---

#### 3.1.1 - Criar Dashboard
- [ ] Criar `src/pages/DashboardPage.tsx`
  - [ ] PageHeader: "Dashboard" ou "Visão Geral"
  - [ ] Breadcrumbs: "Início"

- [ ] Cards de métricas (grid 2x2 ou 4x1)
  - [ ] Total de Produtos Cadastrados
  - [ ] Total de Pedidos Ativos
  - [ ] Pedidos em Produção
  - [ ] Pedidos Próximos do Prazo (< 7 dias)

- [ ] Gráfico de Pedidos por Status
  - [ ] Lib: `recharts`
  - [ ] Tipo: Pie Chart (pizza)
  - [ ] Cores por status

- [ ] Lista de Últimos Pedidos
  - [ ] Tabela compacta
  - [ ] 5-10 pedidos mais recentes
  - [ ] Link "Ver Todos"

- [ ] Atalhos Rápidos
  - [ ] Cards clicáveis
  - [ ] "Novo Produto"
  - [ ] "Novo Pedido"
  - [ ] "Biblioteca de Desenhos"
  - [ ] "Relatório de Materiais"

---

#### 3.1.2 - Definir como Rota Raiz
- [ ] Configurar rota `/app` → DashboardPage
- [ ] Atualizar navegação
- [ ] Testar ao abrir app

---

#### 3.1.3 - Registry
- [ ] Adicionar ao registry (categoria geral ou sem categoria)
- [ ] Icon: LayoutDashboard
- [ ] Sempre disponível na sidebar

---

### 👷 FASE 3.2 - Cadastro de Funcionários (Simplificado)

#### **Objetivo:** CRUD básico de funcionários

---

#### 3.2.1 - Setup
- [ ] Types `src/types/funcionario.types.ts`
  - [ ] Interface `Funcionario`
  - [ ] Interface `FuncionarioFormData`

- [ ] Store `src/stores/funcionariosStore.ts`
  - [ ] CRUD básico

---

#### 3.2.2 - Página de Funcionários
- [ ] Criar `src/pages/cadastros/FuncionariosPage.tsx`
  - [ ] Listagem com tabela
  - [ ] Filtros: busca, cargo, setor
  - [ ] Modal de cadastro/edição
  - [ ] Dialog de exclusão

- [ ] Formulário
  - [ ] Nome Completo (obrigatório)
  - [ ] CPF (validado)
  - [ ] Cargo
  - [ ] Setor
  - [ ] Telefone
  - [ ] Email
  - [ ] Data de Admissão

- [ ] Validações
  - [ ] CPF válido
  - [ ] Email válido

---

#### 3.2.3 - Registry
- [ ] Adicionar 'cadastro-funcionarios' ao cadastrosRegistry
- [ ] Icon: Users2
- [ ] Testar navegação

---

### 🛒 FASE 3.3 - Necessidades de Compras

#### **Objetivo:** Lista de materiais a comprar baseado em pedidos

---

#### 3.3.1 - Página de Necessidades
- [ ] Criar `src/pages/compras/NecessidadesComprasPage.tsx`
  - [ ] PageHeader: "Necessidades de Compras"
  - [ ] Breadcrumbs: "Compras > Necessidades"

- [ ] Seleção de pedidos
  - [ ] Checkbox para múltiplos pedidos
  - [ ] Apenas pedidos APROVADOS ou EM_PRODUCAO
  - [ ] Botão "Calcular Necessidades"

- [ ] Tabela de necessidades
  - [ ] Apenas materiais COMPRADOS
  - [ ] Agrupar por produto (soma quantidade)
  - [ ] Colunas: Código | Descrição | Qtde Total | UN | Pedidos
  - [ ] Checkbox: "Pedido Feito"
  - [ ] Ação: Marcar como pedido

- [ ] Exportar
  - [ ] PDF para enviar ao fornecedor
  - [ ] Excel

---

#### 3.3.2 - Registry
- [ ] Adicionar 'necessidades-compras' ao comprasRegistry
- [ ] Icon: ShoppingCart
- [ ] Testar navegação

---

## 📄 FASE 4 - PÁGINAS FUTURAS (Semana 10)

---

### **Objetivo:** Criar páginas "em desenvolvimento" para demonstrar roadmap

---

#### 4.1 - Template de Página Futura
- [ ] Criar componente `src/components/shared/FutureFeaturePage.tsx`
  - [ ] Props: `title`, `description`, `icon`, `version`
  - [ ] Layout centralizado
  - [ ] Ícone grande (opacidade reduzida)
  - [ ] Título
  - [ ] Descrição
  - [ ] Badge: "Planejado para v2.0" (ou similar)
  - [ ] Botão: "Voltar" ou "Ver Roadmap"

---

#### 4.2 - Páginas a Criar
- [ ] Cronograma (Gantt)
  - [ ] Icon: CalendarClock
  - [ ] Descrição: "Visualização de cronograma de projetos em formato Gantt"

- [ ] Gestão de Estoque
  - [ ] Icon: Package
  - [ ] Descrição: "Controle de entrada, saída e saldo de materiais"

- [ ] Orçamentos Detalhados
  - [ ] Icon: FileText
  - [ ] Descrição: "Geração de orçamentos completos com custos e margens"

- [ ] Análise de Custos
  - [ ] Icon: TrendingUp
  - [ ] Descrição: "Análise de custos de produção e precificação"

- [ ] Relatórios Financeiros
  - [ ] Icon: DollarSign
  - [ ] Descrição: "Relatórios de faturamento, contas a pagar e receber"

- [ ] Gestão de Fornecedores
  - [ ] Icon: Truck
  - [ ] Descrição: "Cadastro completo de fornecedores e histórico de compras"

---

#### 4.3 - Adicionar ao Registry
- [ ] Adicionar todas ao registry apropriado
- [ ] Marcar como "em desenvolvimento" no título
- [ ] Testar abertura via sidebar

---

## ✅ CHECKLIST FINAL DE ENTREGA

---

### Funcionalidades MUST (Essenciais)
- [ ] ✅ Cadastro de Produtos completo
- [ ] ✅ Estrutura de Produtos (BOM) funcionando
- [ ] ✅ Visualizador de Desenhos operacional
- [ ] ✅ Cadastro de Clientes básico
- [ ] ✅ Lançamento de Pedidos
- [ ] ✅ Explosão de Materiais calculada
- [ ] ✅ Relatório de Materiais gerado
- [ ] ✅ Kanban de Projetos funcionando

### Funcionalidades SHOULD (Importantes)
- [ ] ✅ Dashboard com métricas
- [ ] ✅ Cadastro de Funcionários
- [ ] ✅ Necessidades de Compras

### Funcionalidades COULD (Páginas Futuras)
- [ ] ✅ Páginas "em desenvolvimento" criadas
- [ ] ✅ Roadmap visível no sistema

### Qualidade e Testes
- [ ] ✅ Todos os CRUDs testados
- [ ] ✅ Validações funcionando
- [ ] ✅ Responsividade em 3 breakpoints
- [ ] ✅ Dark mode em todas as páginas
- [ ] ✅ Loading states implementados
- [ ] ✅ Error states implementados
- [ ] ✅ Empty states implementados
- [ ] ✅ Toasts de feedback

### Integração Backend
- [ ] ✅ Todos os services criados
- [ ] ✅ API calls implementadas
- [ ] ✅ Error handling
- [ ] ✅ Loading states

### UX/UI
- [ ] ✅ Navegação via sidebar
- [ ] ✅ Breadcrumbs em todas as páginas
- [ ] ✅ Tooltips em ações
- [ ] ✅ Confirmações antes de deletar
- [ ] ✅ Consistent design system
- [ ] ✅ Ícones apropriados

### Performance
- [ ] ✅ Lazy loading de imagens
- [ ] ✅ Paginação implementada
- [ ] ✅ Cache onde aplicável
- [ ] ✅ Otimizações básicas

---

## 🎓 ARGUMENTOS PARA APRESENTAÇÃO TCC

### Complexidade Técnica Demonstrada
- ✅ Estruturas de dados complexas (BOM recursivo)
- ✅ Cálculos recursivos (explosão de materiais)
- ✅ Gerenciamento de estado global (Zustand)
- ✅ Sistema de abas isoladas
- ✅ Upload e visualização de arquivos
- ✅ Drag & Drop (Kanban)
- ✅ Exportação de relatórios (PDF/Excel)

### Arquitetura e Padrões
- ✅ Registry Pattern
- ✅ Component composition
- ✅ Custom hooks
- ✅ Service layer
- ✅ Type safety (TypeScript)
- ✅ Consistent file structure

### UX/UI Profissional
- ✅ Design system (shadcn/ui)
- ✅ Dark mode
- ✅ Responsividade
- ✅ Acessibilidade
- ✅ Feedback visual consistente

### Integração Full-Stack
- ✅ API REST
- ✅ Upload de arquivos
- ✅ Autenticação
- ✅ Persistência de dados

---

**Última atualização:** 20/01/2025
**Status:** 📋 Pronto para implementação
**Próximo passo:** Iniciar Fase 1.1 - Cadastro de Produtos
