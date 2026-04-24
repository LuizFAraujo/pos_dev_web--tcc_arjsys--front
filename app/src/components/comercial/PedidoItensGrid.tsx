/**
 * PedidoItensGrid.tsx — Grid de itens do PV (v3.1) — OPERA EM MEMÓRIA
 *
 * Diferente da v3: não faz mais chamadas de API ao adicionar/remover/editar.
 * O caller (PedidoForm) passa `rows` e recebe `onChange(rows)`. Os itens só
 * são persistidos quando o usuário salva o PV (POST ou PUT consolidado).
 *
 * Isso resolve: "PV sem itens não salva", "itens só somem se eu cancelar",
 * "botão Salvar deve ativar ao mexer em item".
 *
 * Colunas: Qtde | Descrição | Observação (descrição livre — sem produto/preço)
 */

import { InlineEditGrid } from '@/components/shared/InlineEditGrid';
import type { InlineColumn } from '@/components/shared/InlineEditGrid';
import type { ItemPedido } from '@/types/comercial/pedido.types';

/**
 * Linha interna do grid — pode ter id numérico (item persistido) ou
 * "new-xxxx" (item temporário adicionado no form).
 */
export interface PedidoItemRow {
  /** id numérico (item já salvo) ou string "new-xxx" (temporário) */
  id: number | string;
  quantidade: number;
  descricao: string;
  observacao?: string | null;
}

/** Converte um ItemPedido (vindo do back) para PedidoItemRow */
export function itemToRow(item: ItemPedido): PedidoItemRow {
  return {
    id: item.id,
    quantidade: Number(item.quantidade) || 0,
    descricao: item.descricao ?? '',
    observacao: item.observacao ?? null,
  };
}

interface PedidoItensGridProps {
  rows: PedidoItemRow[];
  editable: boolean;
  onChange: (rows: PedidoItemRow[]) => void;
}

const COLUMNS: InlineColumn<PedidoItemRow>[] = [
  {
    key: 'quantidade',
    header: 'Qtde',
    width: 100,
    minWidth: 80,
    align: 'right',
    required: true,
    placeholder: '0',
    inputType: 'decimal',
    validate: (v) => {
      const n = parseFloat(String(v).replace(',', '.'));
      if (Number.isNaN(n)) return 'Número inválido';
      if (n <= 0) return 'Deve ser > 0';
      return null;
    },
  },
  {
    key: 'descricao',
    header: 'Descrição',
    minWidth: 200,
    required: true,
    placeholder: 'Ex.: Picador PIC-500',
    inputType: 'text',
  },
  {
    key: 'observacao',
    header: 'Observação',
    minWidth: 140,
    inputType: 'text',
    placeholder: 'Cor, marca, variação...',
  },
];

export function PedidoItensGrid({ rows, editable, onChange }: PedidoItensGridProps) {
  return (
    <InlineEditGrid<PedidoItemRow>
      rows={rows}
      columns={COLUMNS}
      getRowId={(r) => r.id}
      editable={editable}
      createEmptyRow={(tempId) => ({
        id: tempId,
        quantidade: 1,
        descricao: '',
        observacao: null,
      })}
      onChange={onChange}
      emptyMessage={
        editable
          ? 'Nenhum item. Clique em "Adicionar" para começar.'
          : 'Este pedido não possui itens.'
      }
      footerText={(n) =>
        n === 0 ? 'Nenhum item' : `${n} ${n === 1 ? 'item' : 'itens'}`
      }
    />
  );
}
