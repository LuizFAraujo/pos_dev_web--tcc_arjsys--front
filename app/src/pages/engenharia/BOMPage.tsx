import { useEffect, useRef } from 'react';
import { FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PageHeader } from '@/components/shared/PageHeader';
import { useTabState } from '@/hooks/useTabState';
import { useBOMStore } from '@/stores/engenharia/bomStore';
import { BOMTreeView } from '@/components/engenharia/BOMTreeView';
import { BOMFlatView } from '@/components/engenharia/BOMFlatView';

interface BOMPageProps {
  tab: { id: string; type: string; title: string };
}

type PageMode = 'flat' | 'tree';
const ESC_INTERVAL_MS = 450;

export function BOMPage({ tab }: BOMPageProps) {
  const produtosComEstrutura = useBOMStore((s) => s.produtosComEstrutura);

  const [mode, setMode] = useTabState<PageMode>(tab.id + '-bom-mode', 'flat');
  const [codigoPaiFocus, setCodigoPaiFocus] = useTabState<string>(tab.id + '-bom-focus', '');
  const [clearFiltersFlag, setClearFiltersFlag] = useTabState<number>(tab.id + '-clear', 0);
  const [expandedProducts, setExpandedProducts] = useTabState<string[]>(tab.id + '-products', []);
  const [expandedItems, setExpandedItems] = useTabState<Record<string, string[]>>(tab.id + '-items', {});
  const [isDirty, setIsDirty] = useTabState<boolean>(tab.id + '-dirty', false);

  const lastEscTimeRef = useRef<number>(0);

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

  useEffect(() => {
    if (mode !== 'tree') return;
    if (codigoPaiFocus) return;
    const fallback = produtosComEstrutura?.[0];
    if (fallback) openTreeForPai(fallback);
    else closeTree();
  }, [mode, codigoPaiFocus, produtosComEstrutura]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        breadcrumbs={[{ label: 'Engenharia' }, { label: 'Estrutura de Produtos' }]}
        title="Estrutura de Produtos (BOM)"
        actions={
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleClearAllFilters}>
                    <FilterX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Limpar todos os filtros</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {mode === 'tree' && <Button onClick={requestCloseTree}>Fechar / Sair</Button>}
          </div>
        }
      />

      <div className="flex-1 overflow-hidden">
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
    </div>
  );
}
