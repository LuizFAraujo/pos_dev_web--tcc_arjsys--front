/**
 * CardGrid.tsx — Componente base reutilizável de visualização em cards
 *
 * Funcionalidades:
 * - Hover e seleção com as mesmas cores do DataGrid (sky-200 / slate-100)
 * - Navegação por teclado: setas ←→↑↓ entre cards
 * - Sem botões de ação internos — ações ficam no header da página
 * - Colunas configuráveis (1–4), responsivo por padrão
 * - Cores de hover e seleção configuráveis via props
 * - Callback onSelect para a página reagir ao item selecionado
 * - forwardRef com CardGridHandle para controle externo (clearSelection)
 */

import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  type KeyboardEvent,
} from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CardGridHandle {
  /** Limpa a seleção atual */
  clearSelection: () => void;
}

export interface CardGridProps<T extends { id: number | string }> {
  /** Dados a renderizar */
  data: T[];

  /**
   * Função que recebe o item e retorna o conteúdo interno do card.
   * Não incluir botões de ação — ações ficam no header da página.
   */
  renderCard: (item: T, isSelected: boolean) => React.ReactNode;

  /** ID do item selecionado — controlado pela página via useTabState */
  selectedId: number | string | null;

  /** Callback ao clicar ou navegar para um card. null = deselecionar */
  onSelect: (item: T | null) => void;

  /** Estado de loading */
  loading?: boolean;

  /** Texto exibido durante loading */
  loadingText?: string;

  /** Título da mensagem de lista vazia */
  emptyTitle?: string;

  /** Descrição da mensagem de lista vazia */
  emptyDescription?: string;

  /** Ação (botão) exibido na mensagem de lista vazia */
  emptyAction?: React.ReactNode;

  /**
   * Número de colunas fixo.
   * Se não informado, usa grid responsivo padrão (1 → 2 → 3 → 4).
   */
  cols?: 1 | 2 | 3 | 4;

  /**
   * Classe Tailwind para cor de hover do card.
   * @default 'hover:bg-slate-100 dark:hover:bg-slate-800'
   */
  hoverClass?: string;

  /**
   * Classe Tailwind para cor do card selecionado.
   * @default 'bg-sky-200 dark:bg-sky-900'
   */
  selectedClass?: string;

  /** Classe extra aplicada ao container externo */
  className?: string;
}

// ─── Mapa cols → classe Tailwind ──────────────────────────────────────────────

const COLS_CLASS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

// ─── Componente interno (com generics) ────────────────────────────────────────

function CardGridInner<T extends { id: number | string }>(
  {
    data,
    renderCard,
    selectedId,
    onSelect,
    loading = false,
    loadingText = 'Carregando...',
    emptyTitle = 'Nenhum item encontrado',
    emptyDescription,
    emptyAction,
    cols,
    hoverClass = 'hover:bg-slate-100 dark:hover:bg-slate-800',
    selectedClass = 'bg-sky-200 dark:bg-sky-900',
    className,
  }: CardGridProps<T>,
  ref: React.ForwardedRef<CardGridHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Índice do item selecionado no array atual
  const selectedIndex = data.findIndex((item) => item.id === selectedId);

  // Seleciona pelo índice, com clamp nos limites
  const selectByIndex = useCallback(
    (index: number) => {
      if (data.length === 0) return;
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      onSelect(data[clamped]);
      // Foca o card para acessibilidade
      const cards = containerRef.current?.querySelectorAll<HTMLDivElement>('[data-card]');
      cards?.[clamped]?.focus();
    },
    [data, onSelect],
  );

  // Expõe handle externo
  useImperativeHandle(ref, () => ({
    clearSelection: () => onSelect(null),
  }));

  /**
   * Mede colunas efetivas pelo DOM — compara o offsetTop do card[0] com card[1], [2]...
   * até encontrar um que está numa linha diferente. Isso é 100% preciso
   * independente de breakpoint, zoom ou padding.
   */
  const getMeasuredCols = useCallback((): number => {
    if (cols) return cols;
    const cards = containerRef.current?.querySelectorAll<HTMLDivElement>('[data-card]');
    if (!cards || cards.length < 2) return 1;
    const firstTop = cards[0].getBoundingClientRect().top;
    let count = 1;
    for (let i = 1; i < cards.length; i++) {
      if (Math.abs(cards[i].getBoundingClientRect().top - firstTop) < 4) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [cols]);

  // Navegação por teclado no container
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (data.length === 0) return;
      const current = selectedIndex < 0 ? -1 : selectedIndex;
      const effectiveCols = getMeasuredCols();

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          selectByIndex(current < 0 ? 0 : current + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          selectByIndex(current < 0 ? 0 : current - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          selectByIndex(current < 0 ? 0 : current + effectiveCols);
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectByIndex(current < 0 ? 0 : current - effectiveCols);
          break;
        case 'Home':
          e.preventDefault();
          selectByIndex(0);
          break;
        case 'End':
          e.preventDefault();
          selectByIndex(data.length - 1);
          break;
        default:
          break;
      }
    },
    [data.length, selectedIndex, selectByIndex, getMeasuredCols],
  );

  // Auto-scroll pro card selecionado quando muda por teclado
  useEffect(() => {
    if (selectedIndex < 0) return;
    const cards = containerRef.current?.querySelectorAll<HTMLDivElement>('[data-card]');
    cards?.[selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {loadingText && <p className="text-sm text-muted-foreground">{loadingText}</p>}
      </div>
    );
  }

  // ─── Vazio ────────────────────────────────────────────────────────────────

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <p className="text-base font-medium text-slate-700 dark:text-slate-300">{emptyTitle}</p>
        {emptyDescription && (
          <p className="text-sm text-muted-foreground">{emptyDescription}</p>
        )}
        {emptyAction && <div className="mt-2">{emptyAction}</div>}
      </div>
    );
  }

  // ─── Grid ─────────────────────────────────────────────────────────────────

  const gridColsClass = COLS_CLASS[cols ?? 4];

  return (
    <div
      ref={containerRef}
      role="grid"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={['grid gap-4 p-4 outline-none overflow-y-auto h-full', gridColsClass, className]
        .filter(Boolean)
        .join(' ')}
    >
      {data.map((item) => {
        const isSelected = item.id === selectedId;

        return (
          <div
            key={item.id}
            data-card
            role="gridcell"
            tabIndex={-1}
            aria-selected={isSelected}
            onClick={() => onSelect(isSelected ? null : item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(isSelected ? null : item);
              }
            }}
            className={[
              'rounded-lg border cursor-pointer outline-none',
              'transition-colors duration-100',
              'border-slate-200 dark:border-slate-800',
              // selected sobrescreve hover (ordem importa)
              isSelected
                ? selectedClass
                : ['bg-white dark:bg-slate-900', hoverClass].join(' '),
              'focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-1',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {renderCard(item, isSelected)}
          </div>
        );
      })}
    </div>
  );
}

// ─── Export com forwardRef genérico ──────────────────────────────────────────
// TypeScript não suporta generics diretamente em forwardRef, então fazemos cast

export const CardGrid = forwardRef(CardGridInner) as <T extends { id: number | string }>(
  props: CardGridProps<T> & { ref?: React.ForwardedRef<CardGridHandle> },
) => React.ReactElement;
