/**
 * OrdemProducaoStatusPanel.tsx — Painel controlado de status da OP.
 *
 * Não chama store. Apenas EMITE mudança via onStatusChange.
 * Form pai segura o pendente e aplica no Save.
 */

import { useState } from 'react';
import { ArrowRight, Play, Pause, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JustificativaDialog } from '@/components/shared/JustificativaDialog';
import {
  STATUS_OP_COLORS,
  STATUS_OP_LABELS,
  type OrdemProducao,
  type StatusOrdemProducao,
} from '@/types/producao/ordemProducao.types';

interface Props {
  ordem: OrdemProducao;
  /** Status efetivo (pendente se houver, senão o real). */
  statusExibido: StatusOrdemProducao;
  /** True quando há mudança pendente não salva. */
  temPendente: boolean;
  /** Habilita botões de ação. False = view mode. */
  editable: boolean;
  /** Reporta ao form pai uma mudança de status pendente. */
  onStatusChange: (novoStatus: StatusOrdemProducao, justificativa?: string) => void;
  /** Reporta que o usuário quer descartar a mudança pendente. */
  onClearPendente?: () => void;
}

const EXIGE_JUSTIFICATIVA: StatusOrdemProducao[] = ['Pausada', 'Cancelada'];

export function OrdemProducaoStatusPanel({
  ordem,
  statusExibido,
  temPendente,
  editable,
  onStatusChange,
  onClearPendente,
}: Props) {
  const [justOpen, setJustOpen] = useState(false);
  const [proximoStatus, setProximoStatus] = useState<StatusOrdemProducao | null>(null);

  const statusReal = ordem.status;

  const tentarAlterar = (novo: StatusOrdemProducao) => {
    if (EXIGE_JUSTIFICATIVA.includes(novo)) {
      setProximoStatus(novo);
      setJustOpen(true);
    } else {
      onStatusChange(novo);
    }
  };

  const acoes: {
    status: StatusOrdemProducao;
    label: string;
    icon: any;
    variant: 'default' | 'outline' | 'destructive';
  }[] = [];

  // Ações são calculadas em cima do statusExibido (real ou pendente).
  switch (statusExibido) {
    case 'Pendente':
      acoes.push({ status: 'Andamento', label: 'Iniciar', icon: Play, variant: 'default' });
      acoes.push({ status: 'Cancelada', label: 'Cancelar', icon: XCircle, variant: 'destructive' });
      break;
    case 'Andamento':
      acoes.push({ status: 'Pausada', label: 'Pausar', icon: Pause, variant: 'outline' });
      acoes.push({ status: 'Concluida', label: 'Concluir', icon: CheckCircle2, variant: 'default' });
      acoes.push({ status: 'Cancelada', label: 'Cancelar', icon: XCircle, variant: 'destructive' });
      break;
    case 'Pausada':
      acoes.push({ status: 'Andamento', label: 'Retomar', icon: RotateCcw, variant: 'default' });
      acoes.push({ status: 'Cancelada', label: 'Cancelar', icon: XCircle, variant: 'destructive' });
      break;
  }

  const semAcoes = acoes.length === 0;

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-2 border rounded-md bg-slate-50 dark:bg-slate-900/40 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Status
          </span>

          {/* Real */}
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_OP_COLORS[statusReal] || ''
            }`}
          >
            {STATUS_OP_LABELS[statusReal] || statusReal}
          </span>

          {/* Pendente */}
          {temPendente && statusExibido !== statusReal && (
            <>
              <ArrowRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span
                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ring-2 ring-amber-300 dark:ring-amber-700 ${
                  STATUS_OP_COLORS[statusExibido] || ''
                }`}
                title="Pendente — salve para aplicar"
              >
                {STATUS_OP_LABELS[statusExibido] || statusExibido}
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                pendente
              </span>
              {editable && onClearPendente && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                  onClick={onClearPendente}
                >
                  Descartar
                </Button>
              )}
            </>
          )}

          {!editable && (
            <span className="text-[11px] text-muted-foreground italic">
              · visualização
            </span>
          )}
        </div>

        {editable && !semAcoes && (
          <div className="flex items-center gap-2">
            {acoes.map((a) => {
              const Icon = a.icon;
              return (
                <Button
                  key={a.status}
                  size="sm"
                  variant={a.variant}
                  onClick={() => tentarAlterar(a.status)}
                >
                  <Icon className="h-3.5 w-3.5 mr-1.5" />
                  {a.label}
                </Button>
              );
            })}
          </div>
        )}

        {editable && semAcoes && (
          <span className="text-xs text-muted-foreground italic">
            Estado terminal — sem transições.
          </span>
        )}
      </div>

      <JustificativaDialog
        open={justOpen}
        onOpenChange={(o) => {
          setJustOpen(o);
          if (!o) setProximoStatus(null);
        }}
        title={
          proximoStatus
            ? `Confirmar: ${STATUS_OP_LABELS[proximoStatus]}`
            : 'Confirmar mudança'
        }
        description="Informe o motivo da mudança de status. Será aplicada ao salvar."
        placeholder="Ex: parada de máquina, reprogramação, etc."
        confirmLabel="Marcar como pendente"
        variant={proximoStatus === 'Cancelada' ? 'danger' : 'warning'}
        onConfirm={async (justificativa) => {
          if (proximoStatus) onStatusChange(proximoStatus, justificativa);
        }}
      />
    </>
  );
}
