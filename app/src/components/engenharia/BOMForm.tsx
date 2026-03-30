/**
 * BOMForm.tsx — Form inline de estrutura de produto (BOM)
 *
 * Recebe codigoPai derivado de page.editingItem (não estado separado).
 * Layout: BOMTreeView ocupando todo o espaço.
 * forwardRef com submit() pro PageActions.
 */

import { useEffect, useImperativeHandle, useCallback, forwardRef } from 'react';
import { useTabState } from '@/hooks/useTabState';
import { BOMTreeView } from '@/components/engenharia/BOMTreeView';
import type { PageMode } from '@/components/shared/PageShell';

export interface BOMFormHandle {
  submit: () => Promise<boolean>;
}

interface BOMFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  codigoPai: string;
  onDirty: () => void;
  onSave: () => Promise<void>;
  tabId: string;
}

export const BOMForm = forwardRef<BOMFormHandle, BOMFormProps>(
  function BOMForm({ mode, codigoPai, onDirty, onSave, tabId }, ref) {

    const [expandedProducts, setExpandedProducts] = useTabState<string[]>(tabId + '-products', []);
    const [expandedItems, setExpandedItems] = useTabState<Record<string, string[]>>(tabId + '-items', {});
    const [clearFiltersFlag] = useTabState<number>(tabId + '-clear', 0);

    useEffect(() => {
      if (codigoPai && !expandedProducts.includes(codigoPai)) {
        setExpandedProducts((prev) => [...prev, codigoPai]);
      }
    }, [codigoPai, expandedProducts, setExpandedProducts]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await onSave();
        return true;
      },
    }));

    const toggleProduct = useCallback((codigo: string) => {
      setExpandedProducts((prev) =>
        prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]
      );
    }, [setExpandedProducts]);

    const toggleItem = useCallback((produtoPai: string, codigoItem: string) => {
      setExpandedItems((prev) => {
        const current = prev[produtoPai] || [];
        return {
          ...prev,
          [produtoPai]: current.includes(codigoItem)
            ? current.filter((c) => c !== codigoItem)
            : [...current, codigoItem],
        };
      });
    }, [setExpandedItems]);

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <BOMTreeView
          expandedProducts={expandedProducts}
          expandedItems={expandedItems}
          onToggleProduct={toggleProduct}
          onToggleItem={toggleItem}
          clearFiltersFlag={clearFiltersFlag}
          codigoPaiFocus={codigoPai}
        />
      </div>
    );
  }
);
