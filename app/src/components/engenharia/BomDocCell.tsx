/**
 * BomDocCell.tsx - Célula da coluna DOC. da BOM com miniatura opcional.
 *
 * Quando as miniaturas estão ligadas e o item tem documento, empilha a miniatura
 * (clicável, abre o modal de prévia) com os botões pasta/arquivo centralizados
 * embaixo. Caso contrário, mostra apenas os botões atuais (passados em `buttons`).
 */

import type { ReactNode } from 'react';
import { thumbnailUrl } from '@/lib/api';

/** Proporção largura/altura de uma folha A4 em retrato (210/297). */
export const A4_RATIO = 0.7071;

/** Largura (px) da miniatura retrato para uma dada altura. */
export function thumbWidth(thumbHeight: number) {
  return Math.round(thumbHeight * A4_RATIO);
}

/**
 * Largura (px) da coluna DOC. quando as miniaturas estão ligadas: precisa caber
 * a miniatura retrato e os dois botões (pasta/arquivo) embaixo dela.
 */
export function docColWidth(thumbHeight: number) {
  return Math.max(thumbWidth(thumbHeight), 52) + 24;
}

interface BomDocCellProps {
  /** ID do produto cujo documento será exibido. */
  produtoId: number;
  temDocumento: boolean;
  /** Miniaturas ligadas (toggle global da BOM). */
  enabled: boolean;
  /** Altura da miniatura em px. */
  thumbHeight: number;
  codigo: string;
  /** Abre o modal de prévia. */
  onPreview: () => void;
  /** Botões pasta/arquivo atuais (BomDocButtons ou TreeDocButtons). */
  buttons: ReactNode;
}

export function BomDocCell({ produtoId, temDocumento, enabled, thumbHeight, codigo, onPreview, buttons }: BomDocCellProps) {
  // Sem miniaturas ou sem documento: comportamento atual (só os botões).
  if (!enabled || !temDocumento) return <>{buttons}</>;

  const w = thumbHeight > 110 ? 640 : 320;

  return (
    <div className="flex flex-col items-center gap-1 py-1">
      <img
        src={thumbnailUrl(produtoId, w)}
        alt={codigo}
        loading="lazy"
        decoding="async"
        onClick={(e) => { e.stopPropagation(); onPreview(); }}
        style={{ height: thumbHeight, width: thumbWidth(thumbHeight) }}
        className="cursor-pointer rounded border border-slate-200 bg-white object-contain p-0.5 transition-colors hover:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
        title="Clique para ampliar"
      />
      {buttons}
    </div>
  );
}
