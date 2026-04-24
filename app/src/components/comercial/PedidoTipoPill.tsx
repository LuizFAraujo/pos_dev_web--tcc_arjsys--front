/**
 * PedidoTipoPill.tsx — Seletor compacto de Tipo do Pedido (Normal | PreVenda)
 *
 * Estilo segmented control. Substitui os cartões grandes com texto explicativo
 * (esse texto agora vai pro footer contextual da página conforme seleção).
 */

import type { TipoPedidoVenda } from '@/types/comercial/pedido.types';

interface PedidoTipoPillProps {
  value: TipoPedidoVenda;
  onChange: (tipo: TipoPedidoVenda) => void;
  disabled?: boolean;
  /** id do input raiz (focus/accessible) */
  id?: string;
  /** Texto de erro — se passado, a borda destaca em vermelho */
  error?: string;
}

interface Option {
  value: TipoPedidoVenda;
  label: string;
  sub: string;
  /** classes pra quando SELECIONADO */
  selectedBg: string;
  /** classes pra cor do sub-label SELECIONADO */
  selectedSubText: string;
}

const OPTIONS: Option[] = [
  {
    value: 'Normal',
    label: 'Normal',
    sub: 'Venda realizada',
    selectedBg: 'bg-blue-600 text-white shadow-sm',
    selectedSubText: 'text-blue-100',
  },
  {
    value: 'PreVenda',
    label: 'Pré-venda',
    sub: 'Aguarda NS',
    selectedBg: 'bg-amber-600 text-white shadow-sm',
    selectedSubText: 'text-amber-100',
  },
];

export function PedidoTipoPill({
  value,
  onChange,
  disabled = false,
  id,
  error,
}: PedidoTipoPillProps) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Tipo do pedido"
      className={`inline-flex rounded-lg border p-0.5 bg-muted/40 gap-0.5 ${
        error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'
      } ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`relative flex items-center gap-2 px-3 h-8 rounded-md text-xs font-medium transition-colors
              ${selected
                ? opt.selectedBg
                : 'text-slate-700 dark:text-slate-300 hover:bg-muted/70'}`}
          >
            <span>{opt.label}</span>
            <span
              className={`text-[10px] font-normal ${
                selected ? opt.selectedSubText : 'text-muted-foreground'
              }`}
            >
              · {opt.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Texto de ajuda contextual conforme o tipo selecionado — pro footer da PageShell */
export function helpTipo(tipo: TipoPedidoVenda): string {
  if (tipo === 'Normal') {
    return 'Normal: venda realizada. Nasce em "Liberado"; a Engenharia libera o projeto para a Produção.';
  }
  return 'Pré-venda: gera número de série antes da aprovação. Segue AguardandoNS → Recebido NS → Aguardando Retorno → Liberado.';
}
