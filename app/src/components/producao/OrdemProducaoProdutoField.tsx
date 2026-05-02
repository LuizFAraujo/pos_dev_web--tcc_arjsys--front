/**
 * OrdemProducaoProdutoField.tsx — Seletor de Produto raiz para OP Master.
 * Filtra apenas Fabricados (OP só faz sentido para fabricar).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import type { Produto } from '@/types/engenharia/produto.types';
import { OrdemProducaoProdutoSearchDialog } from './OrdemProducaoProdutoSearchDialog';

interface Props {
  id?: string;
  label?: string;
  value: number | null;
  displayCodigo?: string | null;
  onChange: (produtoId: number | null, produto?: Produto) => void;
  readOnly?: boolean;
  error?: string;
}

export function OrdemProducaoProdutoField({
  id = 'produtoId',
  label = 'Código BOM',
  value,
  displayCodigo,
  onChange,
  readOnly = false,
  error,
}: Props) {
  const produtos = useProdutosStore((s) => s.produtos);
  const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);

  const [codigoText, setCodigoText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const codigoInputRef = useRef<HTMLInputElement>(null);
  const skipAutocompleteRef = useRef(false);

  const hasSelected = value != null && value > 0;

  const produtosElegiveis = produtos.filter((p) => p.tipo === 'Fabricado');

  useEffect(() => {
    if (!readOnly) void fetchProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  useEffect(() => {
    if (hasSelected) {
      setCodigoText(displayCodigo ?? '');
    } else {
      setCodigoText('');
    }
  }, [hasSelected, displayCodigo]);

  const matchPorCodigo = useCallback(
    (term: string): Produto | null => {
      const t = term.trim().toLowerCase();
      if (!t) return null;
      return (
        produtosElegiveis.find((p) => (p.codigo ?? '').toLowerCase() === t) ?? null
      );
    },
    [produtosElegiveis],
  );

  const acceptProduto = useCallback(
    (p: Produto) => {
      onChange(p.id, p);
      setCodigoText(p.codigo ?? '');
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setCodigoText('');
    requestAnimationFrame(() => codigoInputRef.current?.focus());
  }, [onChange]);

  const openSearchDialog = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCodigoText(val);
    if (skipAutocompleteRef.current) {
      skipAutocompleteRef.current = false;
      return;
    }
    if (val.length > 0 && codigoInputRef.current) {
      const term = val.toLowerCase();
      const match = produtosElegiveis.find((p) =>
        (p.codigo ?? '').toLowerCase().startsWith(term),
      );
      if (match && match.codigo) {
        const full = match.codigo;
        codigoInputRef.current.value = full;
        codigoInputRef.current.setSelectionRange(val.length, full.length);
        setCodigoText(full);
      }
    }
  };

  const handleCodigoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'F4') {
      e.preventDefault();
      openSearchDialog();
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      skipAutocompleteRef.current = true;
      return;
    }
    if (e.key === 'Tab' || e.key === 'Enter') {
      const currentValue = codigoInputRef.current?.value || '';
      const match = matchPorCodigo(currentValue);
      if (match) {
        e.preventDefault();
        acceptProduto(match);
      }
    }
  };

  const handleCodigoBlur = () => {
    const match = matchPorCodigo(codigoText);
    if (match) acceptProduto(match);
  };

  if (readOnly) {
    return (
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </Label>
        <Input
          value={displayCodigo ?? '—'}
          readOnly
          className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
          tabIndex={-1}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`${id}-codigo`}
          className={`text-xs font-medium ${
            error
              ? 'text-red-500 dark:text-red-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {label} *
        </Label>
        <div className="relative">
          <input
            ref={codigoInputRef}
            id={`${id}-codigo`}
            type="text"
            placeholder="PRD-0000"
            value={codigoText}
            onChange={handleCodigoChange}
            onKeyDown={handleCodigoKeyDown}
            onBlur={handleCodigoBlur}
            autoComplete="off"
            name="op-produto-codigo"
            data-1p-ignore
            data-lpignore="true"
            className={`flex h-9 w-full rounded-md border bg-white dark:bg-slate-950 px-3 py-1 text-sm font-mono shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
              error ? 'border-red-400 dark:border-red-500' : 'border-input'
            } ${hasSelected ? 'pr-16' : 'pr-9'}`}
          />
          {hasSelected && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-9 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
              title="Limpar seleção"
              tabIndex={-1}
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={openSearchDialog}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Pesquisa avançada (F4)"
            tabIndex={-1}
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
            {error}
          </p>
        )}
      </div>

      <OrdemProducaoProdutoSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        produtos={produtosElegiveis}
        onSelect={acceptProduto}
      />
    </>
  );
}
