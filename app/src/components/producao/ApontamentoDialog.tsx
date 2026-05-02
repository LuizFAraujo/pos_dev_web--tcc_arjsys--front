/**
 * ApontamentoDialog.tsx — Modal de apontamento de produção em um item da OP.
 * Quantidade obrigatória > 0, observação opcional.
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOrdemProducaoStore } from '@/stores/producao/ordemProducaoStore';
import type { OrdemProducaoItem } from '@/types/producao/ordemProducao.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordemId: number;
  item: OrdemProducaoItem | null;
}

export function ApontamentoDialog({ open, onOpenChange, ordemId, item }: Props) {
  const apontar = useOrdemProducaoStore((s) => s.apontar);

  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantidade('');
      setObservacao('');
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!item) return;
    const qtd = parseFloat(quantidade.replace(',', '.'));
    if (isNaN(qtd) || qtd <= 0) {
      toast.error('Informe uma quantidade maior que zero.');
      return;
    }
    if (qtd > item.quantidadeFaltante) {
      toast.error(
        `Quantidade excede o faltante (${item.quantidadeFaltante} ${item.produtoUnidade}).`,
      );
      return;
    }
    setLoading(true);
    try {
      await apontar(ordemId, item.id, {
        quantidade: qtd,
        observacao: observacao.trim() || undefined,
      });
      toast.success('Apontamento registrado.');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao apontar';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Apontar produção
          </DialogTitle>
          <DialogDescription>
            {item.produtoCodigo} — {item.produtoDescricao}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 text-xs py-2">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Planejado</span>
            <span className="font-mono">
              {item.quantidadePlanejada} {item.produtoUnidade}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Produzido</span>
            <span className="font-mono">
              {item.quantidadeProduzida} {item.produtoUnidade}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Faltante</span>
            <span className="font-mono">
              {item.quantidadeFaltante} {item.produtoUnidade}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apontamento-qtd" className="text-xs font-medium">
              Quantidade *
            </Label>
            <Input
              id="apontamento-qtd"
              type="text"
              inputMode="decimal"
              autoFocus
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              className="h-9 font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apontamento-obs" className="text-xs font-medium">
              Observação
            </Label>
            <Textarea
              id="apontamento-obs"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
              placeholder="Opcional"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={loading}>
            Apontar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
