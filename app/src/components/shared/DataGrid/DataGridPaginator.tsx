/**
 * DataGridPaginator.tsx - Rodapé de paginação do DataGrid em modo server-side
 *
 * Mostrado pelo DataGrid quando `serverSide=true` ou quando `total` é fornecido.
 * Composição: [« ‹]  Página X de Y · N registros  [› »]    [tamanho ▼]
 *
 * Botões « » (primeira/última) e ‹ › (anterior/próxima) desabilitam nos extremos.
 * Seletor de tamanho dispara `onTamanhoChange` e o consumer reseta a página pra 1.
 */

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';

export interface DataGridPaginatorProps {
  pagina: number;
  totalPaginas: number;
  total: number;
  tamanho: number;
  tamanhoOptions: number[];
  onPaginaChange: (pagina: number) => void;
  onTamanhoChange: (tamanho: number) => void;
}

export function DataGridPaginator({
  pagina,
  totalPaginas,
  total,
  tamanho,
  tamanhoOptions,
  onPaginaChange,
  onTamanhoChange,
}: DataGridPaginatorProps) {
  const totalSeguro = Math.max(1, totalPaginas);
  const paginaSegura = Math.min(Math.max(1, pagina), totalSeguro);
  const podeVoltar = paginaSegura > 1;
  const podeAvancar = paginaSegura < totalSeguro;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs">
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!podeVoltar}
          onClick={() => onPaginaChange(1)}
          className="h-6 w-6 inline-flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Primeira página"
        >
          <ChevronFirst className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={!podeVoltar}
          onClick={() => onPaginaChange(paginaSegura - 1)}
          className="h-6 w-6 inline-flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        <span className="px-2 text-slate-600 dark:text-slate-300 whitespace-nowrap">
          Página <span className="font-semibold">{paginaSegura}</span> de{' '}
          <span className="font-semibold">{totalSeguro}</span>
          <span className="mx-2 text-slate-400">·</span>
          <span className="font-semibold">{total}</span> registros
        </span>

        <button
          type="button"
          disabled={!podeAvancar}
          onClick={() => onPaginaChange(paginaSegura + 1)}
          className="h-6 w-6 inline-flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={!podeAvancar}
          onClick={() => onPaginaChange(totalSeguro)}
          className="h-6 w-6 inline-flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Última página"
        >
          <ChevronLast className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-slate-500 dark:text-slate-400">Tamanho:</label>
        <select
          value={tamanho}
          onChange={(e) => onTamanhoChange(Number(e.target.value))}
          className="h-6 text-xs border border-slate-200 dark:border-slate-700 rounded px-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {tamanhoOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
