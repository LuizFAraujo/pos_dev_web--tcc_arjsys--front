/**
 * BOMTreeNode - recursivo
 */

import { ChevronRight, ChevronDown } from 'lucide-react';
import type { BOMTreeItem } from '@/stores/engenharia/bomStore';
import { mockProdutos } from '@/data/cadastros/mockProdutos';

interface Props {
  item: BOMTreeItem;
  depth: number;
  produtoPai: string;
  expandedItems: string[];
  onToggleItem: (produtoPai: string, codigoItem: string) => void;
  rowIndex: number;
  getNextRowIndex: () => number;
  onDoubleClick: (codigo: string) => void;
}

function getProdutoInfo(codigo: string) {
  const produto = mockProdutos.find((p) => p.codigo === codigo);
  return {
    descricao: produto?.descricaoCurta || codigo,
    unidade: produto?.unidade || 'UN',
    possuiDesenho: produto?.possuiDesenho ? 'S' : '-',
  };
}

function formatQtde(q: number) {
  return q.toLocaleString('pt-BR',
    {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    });
}

export function BOMTreeNode({ item, depth, produtoPai, expandedItems, onToggleItem, rowIndex, getNextRowIndex, onDoubleClick, }: Props) {
  const { codigo, nivel, ordem, quantidade, hasChildren, children } = item;
  const isExpanded = expandedItems.includes(codigo);
  const indentPx = depth * 8;
  const zebra = rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50';
  const produtoInfo = getProdutoInfo(codigo);

  return (
    <>
      <tr
        className={`${zebra} ${hasChildren ? 'cursor-pointer hover:bg-slate-300' : 'hover:bg-slate-100'}`}
        onClick={() => {
          if (hasChildren) onToggleItem(produtoPai, codigo);
        }}
      >
        <td className="border-b border-r border-slate-200 px-2 py-1.5 text-center font-bold text-slate-800">{nivel}</td>
        <td className="border-b border-r border-slate-200 px-2 py-1.5 text-center text-slate-600">{ordem}</td>
        <td className="border-b border-r border-slate-200 px-2 py-1.5 text-right font-bold text-emerald-700">{formatQtde(quantidade)}</td>

        <td className="border-b border-r border-slate-200 px-2 py-1.5" onDoubleClick={() => onDoubleClick(codigo)}>
          <div className="flex items-center gap-1" style={{ paddingLeft: `${indentPx}px` }}>
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-600" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
              )
            ) : (
              <span className="inline-block w-3.5" />
            )}
            <span className="font-mono text-blue-900">{codigo}</span>
          </div>
        </td>

        <td className="truncate border-b border-r border-slate-200 px-2 py-1.5 font-semibold uppercase text-slate-800">{produtoInfo.descricao}</td>
        <td className="border-b border-r border-slate-200 px-2 py-1.5 text-center text-slate-600">{produtoInfo.unidade}</td>
        <td className="border-b border-slate-200 px-2 py-1.5 text-center text-slate-600">{produtoInfo.possuiDesenho}</td>
      </tr>

      {hasChildren &&
        isExpanded &&
        children?.map((child, idx) => {
          const childRowIndex = getNextRowIndex();
          return (
            <BOMTreeNode
              key={`${produtoPai}__${codigo}__${child.ordem}__${child.codigo}__${idx}`}
              item={child}
              depth={depth + 1}
              produtoPai={produtoPai}
              expandedItems={expandedItems}
              onToggleItem={onToggleItem}
              rowIndex={childRowIndex}
              getNextRowIndex={getNextRowIndex}
              onDoubleClick={onDoubleClick}
            />
          );
        })}
    </>
  );
}
