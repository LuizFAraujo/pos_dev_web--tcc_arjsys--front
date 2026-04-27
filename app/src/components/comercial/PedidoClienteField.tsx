/**
 * PedidoClienteField.tsx — Seletor de cliente em 2 campos digitáveis ligados
 *
 * Pattern de autocomplete inline (estilo NovaEstruturaDialog):
 *   - Digita "5" no Código → completa pra "CLI-0005" com seleção do trecho
 *     extra ("LI-0005"). Continuar digitando sobrescreve a seleção.
 *   - Digita "agro" no Cliente → completa pra "Agroindustria Cerrado" com
 *     seleção do trecho extra. Mesmo comportamento.
 *   - Backspace/Delete cancela autocomplete da rodada (não re-completa).
 *   - Tab/Enter aceita o match completo.
 *   - Match exato em qualquer dos 2 campos → preenche o outro automaticamente.
 *   - X em qualquer campo → limpa os 2.
 *   - Lupa OU F4 abre modal de pesquisa avançada (PedidoClienteSearchDialog).
 *
 * Carregamento: todos os clientes em memória uma vez (estilo NovaEstrutura).
 *
 * Contrato (props) inalterado — chamadores (PedidoForm) não precisam mudar.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Search, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useClientesStore } from '@/stores/admin/clientesStore';
import type { Cliente } from '@/types/admin/cliente.types';
import { Input } from '@/components/ui/input';
import { PedidoClienteSearchDialog } from './PedidoClienteSearchDialog';

interface PedidoClienteFieldProps {
  id?: string;
  label?: string;
  value: number;
  displayName?: string;
  displayCodigo?: string;
  onChange: (clienteId: number, cliente?: Cliente) => void;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
}

export function PedidoClienteField({
  id = 'clienteId',
  label = 'Cliente',
  value,
  displayName,
  displayCodigo,
  onChange,
  readOnly = false,
  required = false,
  error,
}: PedidoClienteFieldProps) {
  const clientes = useClientesStore((s) => s.clientes);
  const fetchClientes = useClientesStore((s) => s.fetchClientes);

  const [codigoText, setCodigoText] = useState('');
  const [nomeText, setNomeText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const codigoInputRef = useRef<HTMLInputElement>(null);
  const nomeInputRef = useRef<HTMLInputElement>(null);
  const skipAutocompleteRef = useRef(false);

  const hasSelected = value > 0;

  useEffect(() => {
    if (clientes.length === 0) void fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (hasSelected) {
      setCodigoText(displayCodigo ?? '');
      setNomeText(displayName ?? '');
    } else {
      setCodigoText('');
      setNomeText('');
    }
  }, [hasSelected, displayCodigo, displayName]);

  const matchPorCodigo = useCallback(
    (term: string): Cliente | null => {
      const t = term.trim().toLowerCase();
      if (!t) return null;
      return clientes.find((c) => (c.codigo ?? '').toLowerCase() === t) ?? null;
    },
    [clientes],
  );

  const matchPorNome = useCallback(
    (term: string): Cliente | null => {
      const t = term.trim().toLowerCase();
      if (!t) return null;
      return clientes.find((c) => (c.nome ?? '').toLowerCase() === t) ?? null;
    },
    [clientes],
  );

  const acceptCliente = useCallback(
    (c: Cliente) => {
      onChange(c.id, c);
      setCodigoText(c.codigo ?? '');
      setNomeText(c.nome ?? '');
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(0);
    setCodigoText('');
    setNomeText('');
    requestAnimationFrame(() => nomeInputRef.current?.focus());
  }, [onChange]);

  const openSearchDialog = useCallback(() => {
    setSearchOpen(true);
  }, []);

  // ─────────────────────── Autocomplete inline — Código ─────────────────────

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCodigoText(val);

    if (skipAutocompleteRef.current) {
      skipAutocompleteRef.current = false;
      return;
    }

    if (val.length > 0 && codigoInputRef.current) {
      const term = val.toLowerCase();
      const match = clientes.find((c) =>
        (c.codigo ?? '').toLowerCase().startsWith(term),
      );
      if (match && match.codigo) {
        const full = match.codigo;
        codigoInputRef.current.value = full;
        codigoInputRef.current.setSelectionRange(val.length, full.length);
        setCodigoText(full);
        return;
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
        acceptCliente(match);
      }
    }
  };

  const handleCodigoBlur = () => {
    const match = matchPorCodigo(codigoText);
    if (match) {
      acceptCliente(match);
    }
  };

  // ─────────────────────── Autocomplete inline — Nome ───────────────────────

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNomeText(val);

    if (skipAutocompleteRef.current) {
      skipAutocompleteRef.current = false;
      return;
    }

    if (val.length > 0 && nomeInputRef.current) {
      const term = val.toLowerCase();
      const match = clientes.find((c) =>
        (c.nome ?? '').toLowerCase().startsWith(term),
      );
      if (match && match.nome) {
        const full = match.nome;
        nomeInputRef.current.value = full;
        nomeInputRef.current.setSelectionRange(val.length, full.length);
        setNomeText(full);
        return;
      }
    }
  };

  const handleNomeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      const currentValue = nomeInputRef.current?.value || '';
      const match = matchPorNome(currentValue);
      if (match) {
        e.preventDefault();
        acceptCliente(match);
      }
    }
  };

  const handleNomeBlur = () => {
    const match = matchPorNome(nomeText);
    if (match) {
      acceptCliente(match);
    }
  };

  // ─────────────────────── Render ───────────────────────────────────────────

  if (readOnly) {
    return (
      <div className="flex gap-2">
        <div className="w-36 shrink-0 flex flex-col gap-1.5">
          <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Código Cliente
          </Label>
          <Input
            value={displayCodigo ?? '—'}
            readOnly
            className="h-9 text-sm bg-white dark:bg-slate-950 font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
            tabIndex={-1}
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {label && (
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {label}
              {required && ' *'}
            </Label>
          )}
          <Input
            value={displayName ?? '—'}
            readOnly
            className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
            tabIndex={-1}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex gap-2">
          {/* Grupo Código Cliente */}
          <div className="w-36 shrink-0 flex flex-col gap-1.5">
            <Label
              htmlFor={`${id}-codigo`}
              className={`text-xs font-medium ${
                error
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Código Cliente
            </Label>
            <div className="relative">
              <input
                ref={codigoInputRef}
                id={`${id}-codigo`}
                type="text"
                placeholder="CLI-0000"
                value={codigoText}
                onChange={handleCodigoChange}
                onKeyDown={handleCodigoKeyDown}
                onBlur={handleCodigoBlur}
                autoComplete="off"
                name="pedido-cliente-codigo"
                data-1p-ignore
                data-lpignore="true"
                className={`flex h-9 w-full rounded-md border bg-white dark:bg-slate-950 px-3 py-1 text-sm font-mono shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  error
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-input'
                } ${hasSelected ? 'pr-8' : ''}`}
              />
              {hasSelected && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                  title="Limpar seleção"
                  tabIndex={-1}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Grupo Cliente */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            {label && (
              <Label
                htmlFor={id}
                className={`text-xs font-medium ${
                  error
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {label}
                {required && ' *'}
              </Label>
            )}

            <div className="relative">
              <input
                ref={nomeInputRef}
                id={id}
                type="text"
                placeholder="Digite o nome do cliente (F4 para pesquisa avançada)"
                value={nomeText}
                onChange={handleNomeChange}
                onKeyDown={handleNomeKeyDown}
                onBlur={handleNomeBlur}
                autoComplete="off"
                name="pedido-cliente-nome"
                data-1p-ignore
                data-lpignore="true"
                className={`flex h-9 w-full rounded-md border bg-white dark:bg-slate-950 px-3 py-1 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  error
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-input'
                }`}
              />
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
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
            {error}
          </p>
        )}
      </div>

      <PedidoClienteSearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        clientes={clientes}
        onSelect={acceptCliente}
      />
    </>
  );
}
