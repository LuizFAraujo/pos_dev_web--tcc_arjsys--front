/**
 * BOMPage.tsx — Estrutura de Produtos (BOM)
 *
 * Dois modos: flat (lista relacional) e tree (árvore de um produto pai).
 * Não usa usePageMode (não é CRUD list/view/edit/new).
 * Usa PageShell como container padronizado.
 *
 * Flat → Tree: duplo clique ou botão na flat view abre tree do produto pai.
 * Tree → Flat: botão Fechar ou duplo ESC.
 */

import { useEffect, useRef } from 'react';
import { FilterX, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { PageShell } from '@/components/shared/PageShell';
import { useTabState } from '@/hooks/useTabState';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { BOMTreeView } from '@/components/engenharia/BOMTreeView';
import { BOMFlatView } from '@/components/engenharia/BOMFlatView';
import { NovaEstruturaDialog } from '@/components/engenharia/NovaEstruturaDialog';

interface BOMPageProps {
  tab: { id: string; type: string; title: string };
}

type PageMode = 'flat' | 'tree';
const ESC_INTERVAL_MS = 450;

export function BOMPage({ tab }: BOMPageProps) {
  const produtosComEstrutura = useBOMStore((s) => s.produtosComEstrutura);
  const fetchProdutosPai = useBOMStore((s) => s.fetchProdutosPai);
  const error = useBOMStore((s) => s.error);

  const [mode, setMode] = useTabState<PageMode>(tab.id + '-bom-mode', 'flat');
  const [codigoPaiFocus, setCodigoPaiFocus] = useTabState<string>(tab.id + '-bom-focus', '');
  const [clearFiltersFlag, setClearFiltersFlag] = useTabState<number>(tab.id + '-clear', 0);
  const [expandedProducts, setExpandedProducts] = useTabState<string[]>(tab.id + '-products', []);
  const [expandedItems, setExpandedItems] = useTabState<Record<string, string[]>>(tab.id + '-items', {});
  const [isDirty, setIsDirty] = useTabState<boolean>(tab.id + '-dirty', false);

  const lastEscTimeRef = useRef<number>(0);

  // Carrega lista de produtos pai ao montar
  useEffect(() => {
    if (produtosComEstrutura.length === 0) {
      fetchProdutosPai();
    }
  }, [produtosComEstrutura.length, fetchProdutosPai]);

  // Toast de erro
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const handleClearAllFilters = () => setClearFiltersFlag((prev) => prev + 1);

  const toggleProduct = (codigo: string) => {
    const isExpanded = expandedProducts.includes(codigo);
    setExpandedProducts(isExpanded ? expandedProducts.filter((c) => c !== codigo) : [...expandedProducts, codigo]);
  };

  const toggleItem = (produtoPai: string, codigoItem: string) => {
    const currentItems = expandedItems[produtoPai] || [];
    const isExpanded = currentItems.includes(codigoItem);
    setExpandedItems({
      ...expandedItems,
      [produtoPai]: isExpanded ? currentItems.filter((c) => c !== codigoItem) : [...currentItems, codigoItem],
    });
  };

  const closeTree = () => {
    setMode('flat');
    lastEscTimeRef.current = 0;
  };

  const requestCloseTree = () => {
    if (!isDirty) {
      closeTree();
      return;
    }
    const ok = window.confirm('Existem alterações pendentes. Sair sem salvar?');
    if (!ok) return;
    setIsDirty(false);
    closeTree();
  };

  const openTreeForPai = (codigoPai: string) => {
    setCodigoPaiFocus(codigoPai);
    setMode('tree');
    if (!expandedProducts.includes(codigoPai)) {
      setExpandedProducts([codigoPai]);
    }
    lastEscTimeRef.current = 0;
  };

  const handleEstruturaCreated = (codigoProduto: string) => {
    openTreeForPai(codigoProduto);
  };

  // Double ESC para fechar tree
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'tree') return;
      if (e.key !== 'Escape') {
        lastEscTimeRef.current = 0;
        return;
      }
      const now = Date.now();
      const delta = now - lastEscTimeRef.current;
      if (delta > ESC_INTERVAL_MS) {
        lastEscTimeRef.current = now;
        const el = document.activeElement as HTMLElement | null;
        if (el?.blur) el.blur();
        return;
      }
      lastEscTimeRef.current = 0;
      requestCloseTree();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mode, isDirty]);

  // Fallback: se abriu tree sem código, pega o primeiro ou volta pra flat
  useEffect(() => {
    if (mode !== 'tree') return;
    if (codigoPaiFocus) return;
    const fallback = produtosComEstrutura?.[0];
    if (fallback) openTreeForPai(fallback);
    else closeTree();
  }, [mode, codigoPaiFocus, produtosComEstrutura]);

  // ── Header right: botões conforme o modo ────────────────────────────────────

  const headerRight = (
    <div className="flex items-center gap-1.5">
      {mode === 'flat' && (
        <NovaEstruturaDialog onEstruturaCreated={handleEstruturaCreated} />
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleClearAllFilters}>
            <FilterX className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>Limpar todos os filtros</p></TooltipContent>
      </Tooltip>

      {mode === 'tree' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={requestCloseTree}>
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Fechar árvore</p></TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  // ── Tag dinâmica ────────────────────────────────────────────────────────────

  const tag = mode === 'tree' && codigoPaiFocus ? codigoPaiFocus : undefined;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <PageShell
      module="Engenharia"
      title="Estrutura de Produtos"
      tag={tag}
      headerRight={headerRight}
    >
      <div className="flex-1 overflow-hidden h-full">
        {mode === 'flat' && (
          <BOMFlatView
            clearFiltersFlag={clearFiltersFlag}
            onOpenPai={openTreeForPai}
            selectedPai={codigoPaiFocus || undefined}
          />
        )}

        {mode === 'tree' && (
          <BOMTreeView
            expandedProducts={expandedProducts}
            expandedItems={expandedItems}
            onToggleProduct={toggleProduct}
            onToggleItem={toggleItem}
            clearFiltersFlag={clearFiltersFlag}
            codigoPaiFocus={codigoPaiFocus || undefined}
          />
        )}
      </div>
    </PageShell>
  );
}
