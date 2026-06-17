/**
 * types.ts - Tipos compartilhados do DataGrid
 *
 * Centraliza todos os tipos usados por DataGrid, ColFilterPopover
 * e FilterConditionRow. Importado por todos os arquivos da pasta.
 */

import type { ReactNode } from 'react';

// ============================================
// TIPOS DE COLUNA
// ============================================

/** Tipos de filtro disponíveis por coluna */
export type GridFilterType = 'text' | 'exact' | 'select' | 'number' | 'checklist';

/** Definição de uma coluna do DataGrid */
export interface GridColumn<T> {
  key: string;                                        // identificador da coluna, deve bater com campo do objeto T
  header: string;                                     // texto exibido no cabeçalho
  contentAlign?: 'left' | 'center' | 'right';         // alinhamento do conteúdo (default: 'left')
  headerAlign?: 'left' | 'center' | 'right';          // alinhamento do cabeçalho (default: 'center')
  className?: string;                                 // classes CSS extras nas células de conteúdo
  render?: (item: T) => ReactNode;                    // render customizado. se não passar, exibe item[key]
  sortable?: boolean;                                 // habilita ordenação (default: true)
  filterType?: GridFilterType | false;                // tipo de filtro: 'text'|'exact'|'select'|'number'|false (default: 'text')
  filterOptions?: { label: string; value: string }[]; // opções do dropdown, obrigatório se filterType 'select'
  filterField?: string;                               // campo do objeto pra filtrar/ordenar, se diferente de key
  resizable?: boolean;                                // habilita redimensionar arrastando borda (default: true, exceto última)
  width?: number;                                     // largura inicial em px (default: 150). última coluna ignora
  minWidth?: number;                                  // largura mínima em px (default: 50)
  maxWidth?: number;                                  // largura máxima em px (default: sem limite)
  widthOverride?: number;                             // força a largura (precede a largura arrastada salva). útil pra coluna reativa
}

// ============================================
// TIPOS DO DATAGRID (PROPS)
// ============================================

/** Props do componente DataGrid */
export interface DataGridProps<T> {
  tabId: string;                // ID da aba - pra persistir sort/filters entre trocas de aba
  storageId?: string;           // ID fixo pra localStorage (ex: 'clientes'). Se não passar, usa tabId
  columns: GridColumn<T>[];     // definição das colunas
  data: T[];                    // dados a exibir
  loading?: boolean;            // exibe spinner (default: false)
  loadingText?: string;         // texto do spinner (default: 'Carregando...')
  emptyTitle?: string;          // título quando sem dados (default: 'Nenhum registro encontrado')
  emptyDescription?: string;    // descrição quando sem dados
  emptyAction?: ReactNode;      // botão/ação quando sem dados
  headerHeight?: number;        // altura do header em px (default: 32)
  rowHeight?: number;           // altura das linhas em px (default: 28)
  /** Altura variável por linha (px). Opcional: sem ela, usa rowHeight fixo. */
  getRowHeight?: (item: T, index: number) => number;
  className?: string;           // classes extras no container

  /**
   * Chamado ao selecionar/deselecionar uma linha (clique ou seta).
   * Recebe o item selecionado, ou null se a seleção foi limpa.
   */
  onSelect?: (item: T | null) => void;

  /**
   * Chamado ao "ativar" uma linha: Enter com linha selecionada, ou duplo clique.
   * Usado para abrir edição diretamente pelo grid.
   */
  onActivate?: (item: T) => void;

  /**
   * Quando `true`, duplo-clique simples (sem Ctrl) ativa a linha (dispara onActivate).
   * Default `false` - mantém comportamento histórico (Ctrl+duplo-clique pra ativar)
   * que evita acionamento acidental em telas de listagem.
   *
   * Útil em modais de seleção, onde o duplo-clique direto é o gesto natural.
   */
  activateOnDoubleClick?: boolean;

  // ── Server-side mode (opcional, scroll infinito) ────────────────────────

  /**
   * Quando `true`, o grid opera em modo "controlled": filtros, ordenação e
   * carregamento são feitos no back (via useGridQuery + POST /buscar). Os
   * itens chegam em chunks, acumulam em `data`, e o grid carrega o próximo
   * chunk via `onCarregarMais` quando o scroll virtualizado se aproxima do
   * fim. Sem isso, segue o modo client-side histórico (tudo em memória).
   */
  serverSide?: boolean;

  /**
   * Total de registros após filtros/busca (vem do PaginadoResponse).
   * Combinado com `totalGeral`, alimenta o rodapé "N de TotalGeral".
   */
  total?: number;

  /**
   * Total de registros da tabela inteira (sem filtros). Mostrado no
   * rodapé como referência: "71089 registros" (limpo) ou "100 de 71089
   * registros" (com filtros/busca).
   */
  totalGeral?: number;

  /**
   * true quando ainda há páginas no back que não foram carregadas — o grid
   * usa pra decidir se vale a pena chamar `onCarregarMais` ao chegar no fim.
   */
  hasMore?: boolean;

  /**
   * Callback disparado quando o usuário rola até as últimas linhas visíveis.
   * O consumer (useGridQuery) debounce/protege contra fetch duplicado.
   */
  onCarregarMais?: () => void;
}

/** Métodos expostos pelo DataGrid via ref */
export interface DataGridHandle {
  clearFilters: () => void;          // limpa filtros de coluna
  clearSort: () => void;             // limpa ordenação
  clearAll: () => void;              // limpa tudo (filtros + sort + seleção)
  focus: () => void;                 // devolve o foco pro container do grid
  scrollToIndex: (index: number) => void;  // scrolla até a linha do índice informado
}

// ============================================
// TIPOS DE FILTRO
// ============================================

/** Condição individual de filtro (usado no popover multi-condição) */
export interface FilterCondition {
  operator: string;    // contem, nao_contem, comeca, termina, igual, diferente
  value: string;       // valor digitado pelo usuário
  logic: 'E' | 'OU';  // lógica com a próxima condição (independente por par)
}

/** Filtro composto - suporta múltiplas condições ou formatos simples */
export interface CompoundFilter {
  type: GridFilterType;
  // Múltiplas condições (usado por filterType 'text')
  conditions?: FilterCondition[];
  // Campos diretos (usado por filterType 'select', 'number', 'exact')
  valor?: string;
  min?: string;
  max?: string;
  // Checklist multi-select (usado por filterType 'checklist')
  checkedValues?: string[];
  // Legado: campos texto antigos (mantidos pra compatibilidade)
  contem?: string;
  comeca?: string;
  termina?: string;
  naoContem?: string;
}

// ============================================
// CONSTANTES
// ============================================

export const DEFAULT_MIN_WIDTH = 50;     // largura mínima padrão de coluna em px
export const DEFAULT_HEADER_HEIGHT = 32; // altura padrão do header em px
export const DEFAULT_ROW_HEIGHT = 28;    // altura padrão das linhas em px


