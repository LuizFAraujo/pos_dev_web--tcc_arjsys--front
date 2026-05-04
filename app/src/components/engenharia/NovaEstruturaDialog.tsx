/**
 * NovaEstruturaDialog.tsx - Dialog para criar nova estrutura de produto (BOM)
 *
 * Autocomplete inline. Todos os produtos aparecem.
 * Fabricado/Kit/Conjunto → aceita direto.
 * Outros tipos → aviso antes de criar.
 */

import { useEffect, useState, useMemo, useRef } from 'react';
import { Search, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { useBOMStore } from '@/stores/engenharia/bomStore';

/** Tipos que aceitam estrutura sem aviso */
const TIPOS_ESTRUTURA = ['fabricado', 'kit', 'conjunto'];

interface NovaEstruturaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEstruturaCreated: (codigoProduto: string) => void;
}

export function NovaEstruturaDialog({ open, onOpenChange, onEstruturaCreated }: NovaEstruturaDialogProps) {
  const [codigo, setCodigo] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [avisoTipoOpen, setAvisoTipoOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipAutocompleteRef = useRef(false);

  const produtos = useProdutosStore((s) => s.produtos);
  const fetchProdutos = useProdutosStore((s) => s.fetchProdutos);
  const produtosComEstrutura = useBOMStore((s) => s.produtosComEstrutura);

  useEffect(() => {
    if (produtos.length === 0) fetchProdutos();
  }, [produtos.length, fetchProdutos]);

  useEffect(() => {
    if (open) {
      setCodigo('');
      setIsCreating(false);
      setAvisoTipoOpen(false);
      skipAutocompleteRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Todos os produtos que ainda não têm estrutura
  const produtosDisponiveis = useMemo(
    () => produtos.filter((p) => !produtosComEstrutura.includes(p.codigo)),
    [produtos, produtosComEstrutura],
  );

  // Match exato (habilita botão)
  const matchExato = useMemo(
    () => produtosDisponiveis.find((p) => p.codigo.toLowerCase() === codigo.trim().toLowerCase()) ?? null,
    [produtosDisponiveis, codigo],
  );

  // Descrição
  const descricao = matchExato?.descricao || '';

  // Verifica se o tipo precisa de aviso
  const tipoNaoEstrutura = matchExato && !TIPOS_ESTRUTURA.includes(matchExato.tipo?.toLowerCase() || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCodigo(val);

    if (skipAutocompleteRef.current) {
      skipAutocompleteRef.current = false;
      return;
    }

    if (val.length > 0 && inputRef.current) {
      const term = val.toLowerCase();
      const match = produtosDisponiveis.find((p) => p.codigo.toLowerCase().startsWith(term));
      if (match) {
        const full = match.codigo;
        inputRef.current.value = full;
        inputRef.current.setSelectionRange(val.length, full.length);
        setCodigo(full);
        return;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      skipAutocompleteRef.current = true;
      return;
    }

    if (e.key === 'Tab' || e.key === 'Enter') {
      const currentValue = inputRef.current?.value || '';
      const match = produtosDisponiveis.find(
        (p) => p.codigo.toLowerCase() === currentValue.toLowerCase()
      );
      if (match) {
        e.preventDefault();
        setCodigo(match.codigo);
        if (inputRef.current) {
          inputRef.current.value = match.codigo;
          inputRef.current.setSelectionRange(match.codigo.length, match.codigo.length);
        }
      }
    }
  };

  const handleClear = () => {
    setCodigo('');
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const doCreate = () => {
    if (!matchExato) return;
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      onOpenChange(false);
      onEstruturaCreated(matchExato.codigo);
    }, 300);
  };

  const handleCreate = () => {
    if (!matchExato) return;
    if (tipoNaoEstrutura) {
      setAvisoTipoOpen(true);
    } else {
      doCreate();
    }
  };

  const handleAvisoConfirm = () => {
    setAvisoTipoOpen(false);
    doCreate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Estrutura de Produto</DialogTitle>
            <DialogDescription>
              Informe o código do produto para iniciar sua estrutura.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Código do Produto *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Digite ou cole o código..."
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="flex h-9 w-full rounded-md border border-input bg-white dark:bg-slate-950 px-3 py-1 pl-9 pr-8 text-sm font-mono shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  autoComplete="off"
                />
                {codigo && (
                  <button type="button" onClick={handleClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={descricao} readOnly placeholder="-"
                className="bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!matchExato || isCreating}>
              {isCreating ? 'Criando...' : 'Criar e Abrir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aviso pra tipos que normalmente não têm estrutura */}
      <AlertDialog open={avisoTipoOpen} onOpenChange={setAvisoTipoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Produto não é fabricado</AlertDialogTitle>
            <AlertDialogDescription>
              O produto <span className="font-mono font-semibold">{matchExato?.codigo}</span> é do tipo <span className="font-semibold">{matchExato?.tipo}</span> e normalmente não possui estrutura de fabricação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogDescription>Deseja criar a estrutura mesmo assim?</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAvisoConfirm}>Criar mesmo assim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
