/**
 * PedidoStatusPanel.tsx — Painel de status compacto (v3.1)
 *
 * Layout (grid flat, compacto):
 *   ┌─────────────────────────────────────────────────────────┐
 *   │ [Badge Status]  Fluxo  ···        [Ações: Avançar...]   │  ← toolbar
 *   ├─────────────────────────────────────────────────────────┤
 *   │ DATA/HORA    EVENTO       DE → PARA       JUSTIFICATIVA  │  ← grid flat
 *   │ 21/04 01:36  Reaberto     Canc → Reab     "reabrindo"   │
 *   │ 21/04 01:36  Cancelado    AguNS → Canc    "teste"       │
 *   │ 21/04 01:33  Criado       —               —             │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Regras v3.1:
 *   - Só exibe ações em modo edit (PedidoForm passa `editable`)
 *   - Em view mode, só status + histórico (sem botões)
 *   - Ações automáticas (Andamento/Concluido) não aparecem (back dispara pelo Produção)
 *   - Retroceder: dropdown com destinos permitidos pelo fluxo
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Undo2,
  Pause,
  Play,
  XCircle,
  RotateCcw,
  PackageX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shared/AppTooltip';
import { JustificativaDialog } from '@/components/shared/JustificativaDialog';
import { usePedidosStore } from '@/stores/comercial/pedidosStore';
import {
  AVANCOS_POR_STATUS,
  EVENTO_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  podeCancelar,
  podeDevolver,
  podePausar,
  podeReabrir,
  podeRetomar,
  statusAnterioresPermitidos,
} from '@/types/comercial/pedido.types';
import type {
  EventoPedido,
  PedidoHistorico,
  PedidoVenda,
  StatusPedido,
} from '@/types/comercial/pedido.types';

interface PedidoStatusPanelProps {
  pedido: PedidoVenda;
  /** Se true, renderiza botões de ação. Se false, só status + histórico. */
  editable: boolean;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hh}:${mm}`;
  } catch {
    return iso;
  }
}

function eventoDotColor(evento: EventoPedido): string {
  switch (evento) {
    case 'Criado':
      return 'bg-slate-400';
    case 'Aprovado':
    case 'LiberadoEntrega':
    case 'Entregue':
    case 'ProducaoConcluida':
      return 'bg-green-500';
    case 'ProducaoIniciada':
    case 'Retomado':
      return 'bg-blue-500';
    case 'NsRecebido':
    case 'RetornoSolicitado':
      return 'bg-amber-500';
    case 'ItensAlterados':
      return 'bg-sky-500';
    case 'Pausado':
      return 'bg-slate-500';
    case 'Cancelado':
      return 'bg-red-500';
    case 'Reaberto':
      return 'bg-purple-500';
    case 'Devolvido':
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
}

type AcaoStatus =
  | { kind: 'avancar'; destino: StatusPedido }
  | { kind: 'retroceder'; destino: StatusPedido }
  | { kind: 'pausar' }
  | { kind: 'retomar' }
  | { kind: 'cancelar' }
  | { kind: 'reabrir' }
  | { kind: 'devolver' };

export function PedidoStatusPanel({ pedido, editable }: PedidoStatusPanelProps) {
  const alterarStatus = usePedidosStore((s) => s.alterarStatus);
  const fetchHistorico = usePedidosStore((s) => s.fetchHistorico);
  const historico = usePedidosStore((s) => s.historico);

  const [acaoPendente, setAcaoPendente] = useState<AcaoStatus | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (pedido.id) void fetchHistorico(pedido.id);
  }, [pedido.id, fetchHistorico]);

  const status = pedido.status;
  const tipo = pedido.tipo;

  const avancos = AVANCOS_POR_STATUS[status] || [];
  const retrocessos = useMemo(
    () => statusAnterioresPermitidos(status, tipo),
    [status, tipo],
  );

  const showPausar = podePausar(status);
  const showRetomar = podeRetomar(status);
  const showCancelar = podeCancelar(status);
  const showReabrir = podeReabrir(status);
  const showDevolver = podeDevolver(status);

  const semAcoes =
    avancos.length === 0 &&
    retrocessos.length === 0 &&
    !showPausar &&
    !showRetomar &&
    !showCancelar &&
    !showReabrir &&
    !showDevolver;

  const doChange = async (novoStatus: StatusPedido, justificativa?: string) => {
    setIsChanging(true);
    try {
      await alterarStatus(pedido.id, novoStatus, justificativa);
    } finally {
      setIsChanging(false);
    }
  };

  const handleAvancar = (destino: StatusPedido) => void doChange(destino);
  const handleRetomar = () => void doChange('Liberado');

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* ══ Toolbar: badge + ações (se editable) ══ */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-b bg-muted/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                STATUS_COLORS[status] || ''
              }`}
            >
              {STATUS_LABELS[status] || status}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Fluxo {tipo === 'PreVenda' ? 'Pré-venda' : 'Normal'}
            </span>
            {!editable && (
              <span className="text-[11px] text-muted-foreground italic">
                · modo visualização
              </span>
            )}
          </div>

          {editable && !semAcoes && (
            <div className="flex flex-wrap items-center gap-1 shrink-0">
              {/* Avançar (verde) */}
              {avancos.map((dest) => (
                <Button
                  key={`avancar-${dest}`}
                  size="sm"
                  className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isChanging}
                  onClick={() => handleAvancar(dest)}
                >
                  <ArrowRight className="h-3 w-3" />
                  Avançar: {STATUS_LABELS[dest]}
                </Button>
              ))}

              {/* Retroceder (amarelo, dropdown) */}
              {retrocessos.length > 0 && (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/20"
                          disabled={isChanging}
                        >
                          <Undo2 className="h-3 w-3" />
                          Retroceder
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Voltar a um status anterior (exige justificativa)</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Voltar para:</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {retrocessos.map((dest) => (
                      <DropdownMenuItem
                        key={`retro-${dest}`}
                        onClick={() =>
                          setAcaoPendente({ kind: 'retroceder', destino: dest })
                        }
                      >
                        <span
                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            STATUS_COLORS[dest] || ''
                          }`}
                        >
                          {STATUS_LABELS[dest]}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {showRetomar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  disabled={isChanging}
                  onClick={handleRetomar}
                >
                  <Play className="h-3 w-3" />
                  Retomar
                </Button>
              )}

              {showPausar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  disabled={isChanging}
                  onClick={() => setAcaoPendente({ kind: 'pausar' })}
                >
                  <Pause className="h-3 w-3" />
                  Pausar
                </Button>
              )}

              {showReabrir && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  disabled={isChanging}
                  onClick={() => setAcaoPendente({ kind: 'reabrir' })}
                >
                  <RotateCcw className="h-3 w-3" />
                  Reabrir
                </Button>
              )}

              {showDevolver && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/20"
                  disabled={isChanging}
                  onClick={() => setAcaoPendente({ kind: 'devolver' })}
                >
                  <PackageX className="h-3 w-3" />
                  Devolver
                </Button>
              )}

              {showCancelar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                  disabled={isChanging}
                  onClick={() => setAcaoPendente({ kind: 'cancelar' })}
                >
                  <XCircle className="h-3 w-3" />
                  Cancelar
                </Button>
              )}
            </div>
          )}

          {editable && semAcoes && (
            <span className="text-[11px] text-muted-foreground italic">
              Nenhuma ação disponível
            </span>
          )}
        </div>

        {/* ══ Grid flat de histórico ══ */}
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {historico.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground italic">
              Nenhum evento registrado.
            </p>
          ) : (
            <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
              <thead className="bg-muted/40 sticky top-0 z-10">
                <tr>
                  <th className="text-left px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 w-28">
                    Data/Hora
                  </th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 w-32">
                    Evento
                  </th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    De → Para
                  </th>
                  <th className="text-left px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Justificativa
                  </th>
                </tr>
              </thead>
              <tbody>
                {historico.map((ev, idx) => renderEventoRow(ev, idx))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Dialog de justificativa ── */}
      <JustificativaDialog
        open={acaoPendente !== null}
        onOpenChange={(o) => !o && setAcaoPendente(null)}
        title={
          acaoPendente?.kind === 'pausar'
            ? 'Pausar pedido'
            : acaoPendente?.kind === 'cancelar'
              ? 'Cancelar pedido'
              : acaoPendente?.kind === 'reabrir'
                ? 'Reabrir pedido'
                : acaoPendente?.kind === 'devolver'
                  ? 'Registrar devolução'
                  : acaoPendente?.kind === 'retroceder'
                    ? `Retroceder para "${STATUS_LABELS[acaoPendente.destino]}"`
                    : ''
        }
        description={
          acaoPendente?.kind === 'pausar'
            ? 'Descreva o motivo da pausa.'
            : acaoPendente?.kind === 'cancelar'
              ? 'Descreva o motivo do cancelamento.'
              : acaoPendente?.kind === 'reabrir'
                ? 'Descreva o motivo de reabrir o pedido.'
                : acaoPendente?.kind === 'devolver'
                  ? 'Descreva o motivo da devolução.'
                  : acaoPendente?.kind === 'retroceder'
                    ? 'Descreva o motivo de retroceder o fluxo.'
                    : undefined
        }
        confirmLabel={
          acaoPendente?.kind === 'pausar'
            ? 'Pausar'
            : acaoPendente?.kind === 'cancelar'
              ? 'Cancelar pedido'
              : acaoPendente?.kind === 'reabrir'
                ? 'Reabrir'
                : acaoPendente?.kind === 'devolver'
                  ? 'Registrar devolução'
                  : 'Retroceder'
        }
        variant={
          acaoPendente?.kind === 'cancelar' || acaoPendente?.kind === 'devolver'
            ? 'danger'
            : acaoPendente?.kind === 'pausar' || acaoPendente?.kind === 'retroceder'
              ? 'warning'
              : 'neutral'
        }
        onConfirm={async (justificativa) => {
          if (!acaoPendente) return;
          const destino: StatusPedido =
            acaoPendente.kind === 'pausar'
              ? 'Pausado'
              : acaoPendente.kind === 'cancelar'
                ? 'Cancelado'
                : acaoPendente.kind === 'reabrir'
                  ? 'Reaberto'
                  : acaoPendente.kind === 'devolver'
                    ? 'Devolvido'
                    : acaoPendente.destino;
          await doChange(destino, justificativa);
        }}
      />
    </>
  );

  // ═════ Helpers internos ═════

  function renderEventoRow(ev: PedidoHistorico, idx: number) {
    return (
      <tr
        key={ev.id}
        className={`border-t ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
      >
        <td className="px-3 py-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
          {formatDateTime(ev.dataHora)}
        </td>
        <td className="px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${eventoDotColor(
                ev.evento,
              )}`}
            />
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
              {EVENTO_LABELS[ev.evento] || ev.evento}
            </span>
          </div>
        </td>
        <td className="px-3 py-1.5">
          {ev.statusAnterior && ev.statusNovo ? (
            <div className="flex items-center gap-1 flex-wrap">
              <span
                className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  STATUS_COLORS[ev.statusAnterior] || ''
                }`}
              >
                {STATUS_LABELS[ev.statusAnterior]}
              </span>
              <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
              <span
                className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  STATUS_COLORS[ev.statusNovo] || ''
                }`}
              >
                {STATUS_LABELS[ev.statusNovo]}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 italic truncate">
          {ev.justificativa ? `"${ev.justificativa}"` : '—'}
        </td>
      </tr>
    );
  }
}
