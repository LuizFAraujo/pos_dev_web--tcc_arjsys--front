/**
 * OrdemProducaoPedidoField.tsx — Seletor de Pedido para criar OP Master.
 *
 * Filtra PVs com status que aceitam OP nova: Liberado, Andamento, Pausado.
 * Suporta marcar "OP de estoque" (sem PV) via prop estoque.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import type { PedidoVenda } from '@/types/comercial/pedido.types';
import { OrdemProducaoPedidoSearchDialog } from './OrdemProducaoPedidoSearchDialog';

const STATUS_PERMITIDOS = ['Liberado', 'Andamento', 'Pausado'] as const;

interface Props {
  id?: string;
  label?: string;
  value: number | null;
  displayCodigo?: string | null;
  onChange: (pedidoVendaId: number | null, pedido?: PedidoVenda) => void;
  readOnly?: boolean;
  disabled?: boolean;
  error?: string;
}

export function OrdemProducaoPedidoField({
  id = 'pedidoVendaId',
  label = 'Pedido de Venda',
  value,
  displayCodigo,
  onChange,
  readOnly = false,
  disabled = false,
  error,
}: Props) {
  const pedidos = usePedidosStore((s) => s.pedidos);
  const fetchPedidos = usePedidosStore((s) => s.fetchPedidos);

  const [codigoText, setCodigoText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const codigoInputRef = useRef<HTMLInputElement>(null);
  const skipAutocompleteRef = useRef(false);

  const hasSelected = value != null && value > 0;

  const pedidosElegiveis = pedidos.filter((p) =>
    STATUS_PERMITIDOS.includes(p.status as typeof STATUS_PERMITIDOS[number]),
  );

  useEffect(() => {
    if (!readOnly && !disabled) void fetchPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, disabled]);

  useEffect(() => {
    if (hasSelected) {
      setCodigoText(displayCodigo ?? '');
    } else {
      setCodigoText('');
    }
  }, [hasSelected, displayCodigo]);

  const matchPorCodigo = useCallback(
    (term: string): PedidoVenda | null => {
      const t = term.trim().toLowerCase();
      if (!t) return null;
      return (
        pedidosElegiveis.find((p) => (p.codigo ?? '').toLowerCase() === t) ?? null
      );
    },
    [pedidosElegiveis],
  );

  const acceptPedido = useCallback(
    (p: PedidoVenda) => {
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
    if (!disabled) setSearchOpen(true);
  }, [disabled]);

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCodigoText(val);
    if (skipAutocompleteRef.current) {
      skipAutocompleteRef.current = false;
      return;
    }
    if (val.length > 0 && codigoInputRef.current) {
      const term = val.toLowerCase();
      const match = pedidosElegiveis.find((p) =>
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
        acceptPedido(match);
      }
    }
  };

  const handleCodigoBlur = () => {
    const match = matchPorCodigo(codigoText);
    if (match) acceptPedido(match);
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
          {label}
        </Label>
        <div className="relative">
          <input
            ref={codigoInputRef}
            id={`${id}-codigo`}
            type="text"
            placeholder={disabled ? '— (Estoque)' : 'PV.AAAA.MM.NNNN'}
            value={codigoText}
            onChange={handleCodigoChange}
            onKeyDown={handleCodigoKeyDown}
            onBlur={handleCodigoBlur}
            autoComplete="off"
            name="op-pedido-codigo"
            data-1p-ignore
            data-lpignore="true"
            disabled={disabled}
            className={`flex h-9 w-full rounded-md border bg-white dark:bg-slate-950 px-3 py-1 text-sm font-mono shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed ${
              error ? 'border-red-400 dark:border-red-500' : 'border-input'
            } ${hasSelected ? 'pr-16' : 'pr-9'}`}
          />
          {hasSelected && !disabled && (
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
            disabled={disabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

      <OrdemProducaoPedidoSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        pedidos={pedidosElegiveis}
        onSelect={acceptPedido}
      />
    </>
  );
}
