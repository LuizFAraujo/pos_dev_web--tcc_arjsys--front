/**
 * CardGrid.tsx — Componente base reutilizável de visualização em cards
 *
 * Funcionalidades:
 * - Hover e seleção com as mesmas cores do DataGrid (sky-200 / slate-100)
 * - Navegação por teclado: setas ←→↑↓ entre cards
 * - Enter com card selecionado → onActivate (abre visualização)
 * - Duplo clique no card → onActivate
 * - Sem botões de ação internos — ações ficam no header da página
 * - Colunas configuráveis (1–4), responsivo por padrão
 * - Cores de hover e seleção configuráveis via props
 * - Callback onSelect para a página reagir ao item selecionado
 * - forwardRef com CardGridHandle para controle externo (clearSelection)
 * - Virtualização via @tanstack/react-virtual (suporta 70k+ itens)
 * - Rodapé com contador de registros
 *
 * Espaçamentos controlados pelas constantes GAP_X, GAP_Y, PAD_X, PAD_Y no topo.
 */

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  type KeyboardEvent,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

// ─── Constantes de espaçamento (ajuste aqui) ─────────────────────────────────

/** Gap horizontal entre cards em px */
const GAP_X = 6;
/** Gap vertical entre linhas de cards em px */
const GAP_Y = 6;
/** Padding externo horizontal do container em px */
const PAD_X = 4;
/** Padding externo vertical do container em px */
const PAD_Y = 4;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CardGridHandle {
  /** Limpa a seleção atual */
  clearSelection: () => void;
  /** Devolve o foco pro container (usar com useRestoreFocus) */
  focus: () => void;
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

  /**
   * Chamado ao "ativar" um card: Enter com card selecionado, ou duplo clique.
   * Usado para abrir visualização diretamente pelo card.
   */
  onActivate?: (item: T) => void;

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

  /**
   * Altura estimada de cada card em px (pra virtualização).
   * @default 100
   */
  cardHeight?: number;

  /**
   * Total de registros antes de filtrar (pra exibir "X de Y" no rodapé).
   * Se não informado, mostra apenas data.length.
   */
  totalCount?: number;
}

// ─── Componente interno (com generics) ────────────────────────────────────────

function CardGridInner<T extends { id: number | string }>(
  {
    data,
    renderCard,
    selectedId,
    onSelect,
    onActivate,
    loading = false,
    loadingText = 'Carregando...',
    emptyTitle = 'Nenhum item encontrado',
    emptyDescription,
    emptyAction,
    cols,
    hoverClass = 'hover:bg-slate-100 dark:hover:bg-slate-800',
    selectedClass = 'bg-sky-200 dark:bg-sky-900',
    className,
    cardHeight = 100,
    totalCount,
  }: CardGridProps<T>,
  ref: React.ForwardedRef<CardGridHandle>,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onActivateRef = useRef(onActivate);
  onActivateRef.current = onActivate;

  // ── Medir colunas efetivas ──────────────────────────────────────────────────

  const [measuredCols, setMeasuredCols] = useState(cols ?? 4);

  const measureCols = useCallback(() => {
    if (cols) { setMeasuredCols(cols); return; }
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth - PAD_X * 2;
    if (w < 500) setMeasuredCols(1);
    else if (w < 700) setMeasuredCols(2);
    else if (w < 950) setMeasuredCols(3);
    else setMeasuredCols(4);
  }, [cols]);

  useEffect(() => {
    measureCols();
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => measureCols());
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureCols]);

  // ── Agrupar dados em linhas ─────────────────────────────────────────────────

  const rowCount = Math.ceil(data.length / measuredCols);

  // ── Virtualização ───────────────────────────────────────────────────────────

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => cardHeight + GAP_Y,
    overscan: 5,
    measureElement: (el) => {
      if (!el) return cardHeight + GAP_Y;
      return el.getBoundingClientRect().height;
    },
  });

  const virtualRows = virtualizer.getVirtualItems();

  // ── Seleção ─────────────────────────────────────────────────────────────────

  const selectedIndex = data.findIndex((item) => item.id === selectedId);

  const selectByIndex = useCallback(
    (index: number) => {
      if (data.length === 0) return;
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      onSelect(data[clamped]);
    },
    [data, onSelect],
  );

  useImperativeHandle(ref, () => ({
    clearSelection: () => onSelect(null),
    focus: () => containerRef.current?.focus(),
  }));

  // ── Teclado ─────────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (data.length === 0) return;
      const current = selectedIndex < 0 ? -1 : selectedIndex;

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
          selectByIndex(current < 0 ? 0 : current + measuredCols);
          break;
        case 'ArrowUp':
          e.preventDefault();
          selectByIndex(current < 0 ? 0 : current - measuredCols);
          break;
        case 'Enter': {
          e.preventDefault();
          if (selectedIndex >= 0) {
            const item = data[selectedIndex];
            setTimeout(() => onActivateRef.current?.(item), 0);
          }
          break;
        }
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
    [data, selectedIndex, selectByIndex, measuredCols],
  );

  // Auto-scroll pro card selecionado
  useEffect(() => {
    if (selectedIndex < 0) return;
    const rowIdx = Math.floor(selectedIndex / measuredCols);
    virtualizer.scrollToIndex(rowIdx, { align: 'auto' });
  }, [selectedIndex, measuredCols, virtualizer]);

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

  // ─── Grid virtualizado ────────────────────────────────────────────────────

  const total = totalCount ?? data.length;

  return (
    <div className={['flex flex-col h-full overflow-hidden', className].filter(Boolean).join(' ')}>
      <div
        ref={containerRef}
        role="grid"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none overflow-y-auto flex-1"
        style={{ padding: `${PAD_Y}px ${PAD_X}px` }}
      >
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualRows.map((vRow) => {
            const rowStartIdx = vRow.index * measuredCols;
            const rowItems = data.slice(rowStartIdx, rowStartIdx + measuredCols);

            return (
              <div
                key={vRow.index}
                data-index={vRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${measuredCols}, 1fr)`,
                  gap: `0 ${GAP_X}px`,
                  paddingBottom: `${GAP_Y}px`,
                }}
              >
                {rowItems.map((item) => {
                  const isSelected = item.id === selectedId;

                  return (
                    <div
                      key={item.id}
                      data-card
                      role="gridcell"
                      tabIndex={-1}
                      aria-selected={isSelected}
                      onClick={() => onSelect(isSelected ? null : item)}
                      onDoubleClick={() => onActivateRef.current?.(item)}
                      className={[
                        'rounded-lg border cursor-pointer outline-none overflow-hidden',
                        'transition-colors duration-100',
                        'border-slate-200 dark:border-slate-800',
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
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="shrink-0 border-t bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground flex items-center">
        <span>{data.length} {data.length === 1 ? 'registro' : 'registros'}{data.length !== total ? ` de ${total}` : ''}</span>
      </div>
    </div>
  );
}

// ─── Export com forwardRef genérico ──────────────────────────────────────────

export const CardGrid = forwardRef(CardGridInner) as <T extends { id: number | string }>(
  props: CardGridProps<T> & { ref?: React.ForwardedRef<CardGridHandle> },
) => React.ReactElement;
