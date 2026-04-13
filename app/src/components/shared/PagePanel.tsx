/**
 * PagePanel.tsx — Painel lateral direito limitado à área de conteúdo da página
 *
 * Usa o Sheet do shadcn (Radix Dialog) pra ter a mesma animação suave
 * do RightSidebar global. A diferença é que o portal renderiza dentro
 * de um container relativo (PageShell content area) em vez de full-screen.
 *
 * Funcionalidades:
 * - Mesma animação do RightSidebar global (Sheet/Radix)
 * - Backdrop escuro com click-outside para fechar
 * - Tecla ESC fecha
 * - Altura limitada à área de conteúdo (não cobre header/footer do PageShell)
 * - Componente genérico — cada page passa título e children
 *
 * Uso:
 *   <PagePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Filtros">
 *     <p>Conteúdo do painel...</p>
 *   </PagePanel>
 *
 * Renderizar DENTRO do PageShell (como irmão do DataGrid/CardGrid).
 * O PageShell já tem `relative` no container de conteúdo.
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PagePanelProps {
  /** Controla se o painel está aberto */
  open: boolean;

  /** Callback para fechar o painel */
  onClose: () => void;

  /** Título exibido no header do painel */
  title: string;

  /** Largura do painel (default: 'w-80' = 320px) */
  width?: string;

  /** Conteúdo do painel */
  children: ReactNode;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PagePanel({ open, onClose, title, width = 'w-80', children }: PagePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC fecha o painel
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop — absolute pra ficar dentro do container pai */}
      <div
        className={`absolute inset-0 z-40 bg-black/50 transition-opacity ease-in-out ${
          open
            ? 'opacity-100 duration-500'
            : 'opacity-0 duration-300 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Painel */}
      <div
        ref={panelRef}
        className={`absolute top-0 right-0 bottom-0 ${width} max-w-full bg-white dark:bg-slate-900 shadow-lg z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transition-transform ease-in-out ${
          open
            ? 'translate-x-0 duration-500'
            : 'translate-x-full duration-300'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}
