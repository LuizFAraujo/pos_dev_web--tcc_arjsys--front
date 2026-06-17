/**
 * BomDocCell.tsx - Célula da coluna DOC. da BOM com miniatura opcional.
 *
 * Quando as miniaturas estão ligadas e o item tem documento, empilha a miniatura
 * (clicável, abre o modal de prévia) com os botões pasta/arquivo centralizados
 * embaixo. Caso contrário, mostra apenas os botões atuais (passados em `buttons`).
 */

import type { ReactNode } from 'react';
import { thumbnailUrl } from '@/lib/api';

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
        style={{ maxHeight: thumbHeight, maxWidth: '100%' }}
        className="cursor-pointer rounded border border-slate-200 bg-white p-0.5 transition-colors hover:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
        title="Clique para ampliar"
      />
      {buttons}
    </div>
  );
}
