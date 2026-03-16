/**
 * types.ts — Tipos compartilhados do DataGrid
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
}

// ============================================
// TIPOS DO DATAGRID (PROPS)
// ============================================

/** Props do componente DataGrid */
export interface DataGridProps<T> {
  tabId: string;                // ID da aba — pra persistir sort/filters entre trocas de aba
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
}

/** Métodos expostos pelo DataGrid via ref */
export interface DataGridHandle {
  clearFilters: () => void;   // limpa filtros de coluna
  clearSort: () => void;      // limpa ordenação
  clearAll: () => void;       // limpa tudo (filtros + sort + seleção)
  focus: () => void;          // devolve o foco pro container do grid (usar com useRestoreFocus)
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

/** Filtro composto — suporta múltiplas condições ou formatos simples */
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
