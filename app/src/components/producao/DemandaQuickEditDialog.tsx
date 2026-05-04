/**
 * DemandaQuickEditDialog.tsx - Edição rápida de uma linha da Demanda.
 *
 * Modal sem grid: info da OP+produto em linhas separadas + único campo
 * editável (quantidade produzida) com setas de incremento/decremento.
 * Recalcula faltante/% ao vivo. Salvar valida no back via /apontar com delta.
 * Redução exige justificativa. Aviso ao fechar com alterações pendentes.
 */

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { JustificativaDialog } from '@/components/shared/JustificativaDialog';
import { NumberStepper } from '@/components/shared/NumberStepper';
import {
  STATUS_OP_COLORS,
  STATUS_OP_LABELS,
} from '@/types/producao/ordemProducao.types';
import { TIPO_PRODUTO_LABELS } from '@/types/engenharia/produto.types';
import { useOrdemProducaoStore } from '@/stores/producao/ordemProducaoStore';
import { useDemandaStore } from '@/stores/producao/demandaStore';
import type { DemandaItem } from '@/types/producao/demanda.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DemandaItem | null;
  /** Recarrega a demanda após salvar com sucesso. */
  onAfterSave?: () => void;
}

export function DemandaQuickEditDialog({
  open,
  onOpenChange,
  item,
  onAfterSave,
}: Props) {
  const apontar = useOrdemProducaoStore((s) => s.apontar);
  const patchItem = useDemandaStore((s) => s.patchItem);

  const [produzidoStr, setProduzidoStr] = useState('');
  const [committed, setCommitted] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [justOpen, setJustOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [justResolver, setJustResolver] = useState<
    ((v: string | null) => void) | null
  >(null);

  useEffect(() => {
    if (open && item) {
      setProduzidoStr(String(item.quantidadeProduzida));
      setCommitted(item.quantidadeProduzida);
    }
  }, [open, item]);

  const produzidoNum = useMemo(() => {
    const n = parseFloat(produzidoStr.replace(',', '.'));
    return Number.isNaN(n) ? committed : n;
  }, [produzidoStr, committed]);

  const dirty = produzidoNum !== committed;

  const faltanteCalc = useMemo(() => {
    if (!item) return 0;
    return item.quantidadePlanejada - produzidoNum;
  }, [item, produzidoNum]);

  const pctCalc = useMemo(() => {
    if (!item || item.quantidadePlanejada <= 0) return 0;
    return Math.round((produzidoNum / item.quantidadePlanejada) * 100);
  }, [item, produzidoNum]);

  if (!item) return null;

  const opNaoAndamento = item.statusOp !== 'Andamento';

  const validar = (): string | null => {
    if (opNaoAndamento)
      return 'OP precisa estar em Andamento para registrar produção.';
    if (Number.isNaN(produzidoNum)) return 'Quantidade inválida.';
    if (produzidoNum < 0)
      return 'Quantidade produzida não pode ser negativa.';
    if (produzidoNum > item.quantidadePlanejada)
      return `Quantidade ultrapassa o planejado (${item.quantidadePlanejada}).`;
    return null;
  };

  const pedirJustificativa = (): Promise<string | null> =>
    new Promise((resolve) => {
      setJustResolver(() => resolve);
      setJustOpen(true);
    });

  const enviar = async (justificativa?: string) => {
    const delta = produzidoNum - committed;
    if (delta === 0) return;
    setSaving(true);
    try {
      await apontar(item.ordemProducaoId, item.ordemProducaoItemId, {
        quantidade: delta,
        observacao: justificativa,
      });
      setCommitted(produzidoNum);

      // Atualização cirúrgica (sem refetch + sem flicker).
      // Mantém linha mesmo a 100% pra histórico visual.
      const novoFaltante = item.quantidadePlanejada - produzidoNum;
      const novoPct =
        item.quantidadePlanejada > 0
          ? Math.round((produzidoNum / item.quantidadePlanejada) * 10000) / 100
          : 0;
      patchItem(item.ordemProducaoItemId, {
        quantidadeProduzida: produzidoNum,
        quantidadeFaltante: novoFaltante,
        percentualConcluido: novoPct,
      });
      toast.success('Quantidade atualizada.');
      onAfterSave?.();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSalvar = async () => {
    const erro = validar();
    if (erro) {
      toast.error(erro);
      return;
    }
    const delta = produzidoNum - committed;
    if (delta === 0) {
      onOpenChange(false);
      return;
    }
    if (delta < 0) {
      const just = await pedirJustificativa();
      if (!just) return;
      await enviar(just);
      return;
    }
    await enviar();
  };

  const handleFechar = () => {
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) handleFechar();
          else onOpenChange(true);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2 flex-wrap">
              <span className="font-mono">{item.ordemProducaoCodigo}</span>
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  STATUS_OP_COLORS[item.statusOp] || ''
                }`}
              >
                {STATUS_OP_LABELS[item.statusOp] || item.statusOp}
              </span>
              {dirty && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Alterado
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Identificação do produto - linhas separadas */}
          <div className="flex flex-col gap-2 pt-1 pb-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Cód. produto
              </span>
              <span className="font-mono text-sm">{item.produtoCodigo}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Descrição
              </span>
              <span className="text-sm wrap-break-word">
                {item.produtoDescricao}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Tipo
                </span>
                <span className="text-sm">
                  {TIPO_PRODUTO_LABELS[item.tipoProduto] || item.tipoProduto}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Unidade
                </span>
                <span className="text-sm">{item.produtoUnidade}</span>
              </div>
            </div>
          </div>

          {/* Indicadores */}
          <div className="grid grid-cols-4 gap-3 text-xs py-2 border-y border-slate-200 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Planejado</span>
              <span className="font-mono">
                {item.quantidadePlanejada} {item.produtoUnidade}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Produzido</span>
              <span className="font-mono">
                {produzidoNum} {item.produtoUnidade}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Faltante</span>
              <span className="font-mono">
                {faltanteCalc} {item.produtoUnidade}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">% concluído</span>
              <span className="font-mono">{pctCalc}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-2">
            <Label htmlFor="dq-produzido" className="text-xs font-medium">
              Quantidade produzida {opNaoAndamento ? '(somente leitura)' : ''}
            </Label>
            <NumberStepper
              id="dq-produzido"
              value={produzidoStr}
              onChange={setProduzidoStr}
              min={0}
              max={item.quantidadePlanejada}
              step={1}
              autoFocus={!opNaoAndamento}
              disabled={opNaoAndamento}
              readOnly={opNaoAndamento}
              className="max-w-xs"
            />
            {opNaoAndamento && (
              <p className="text-[11px] text-muted-foreground italic">
                OP não está em Andamento. Mude o status na tela de OP antes de
                registrar produção.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFechar}
              disabled={saving}
            >
              Fechar
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSalvar()}
              disabled={!dirty || saving || opNaoAndamento}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <JustificativaDialog
        open={justOpen}
        onOpenChange={(o) => {
          setJustOpen(o);
          if (!o && justResolver) {
            justResolver(null);
            setJustResolver(null);
          }
        }}
        title="Reduzir quantidade produzida"
        description="A nova quantidade é menor que a atual. Informe o motivo (registrado no histórico)."
        placeholder="Ex.: contagem corrigida após inspeção..."
        confirmLabel="Confirmar redução"
        variant="warning"
        onConfirm={(just) => {
          justResolver?.(just);
          setJustResolver(null);
        }}
      />

      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair sem salvar?</AlertDialogTitle>
            <AlertDialogDescription>
              Há alterações não salvas. O que deseja fazer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false);
                onOpenChange(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
