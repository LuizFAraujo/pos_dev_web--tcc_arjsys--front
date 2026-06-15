/**
 * DocPreviewDialog.tsx - Modal de prévia ampliada do documento.
 *
 * Componente compartilhado (Produtos e BOM). Mostra o documento ORIGINAL, não a
 * miniatura: PDF embutido no visualizador nativo do navegador (rola, dá zoom,
 * começa na página 1) ou imagem em tamanho real.
 *
 * Layout (mock A):
 *   - faixa fina no topo: toggle da barra do PDF + fechar (X);
 *   - documento ocupando todo o espaço restante;
 *   - rodapé com código + ações (pasta, arquivo, nova aba), descrição embaixo.
 *
 * Redimensionável pelo canto inferior direito (puxador), com o tamanho salvo
 * globalmente por usuário. A barra do PDF é um toggle opcional, também salvo.
 */

import { useEffect, useRef, useState } from 'react';
import { FileX2, ExternalLink, PanelTop, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { DocButtons } from '@/components/shared/DocButtons';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { documentoUrl } from '@/lib/api';
import { useDocPreviewStore } from '@/stores/engenharia/docPreviewStore';

// Limites do redimensionamento.
const MIN_W = 420;
const MIN_H = 320;
const maxW = () => window.innerWidth * 0.96;
const maxH = () => window.innerHeight * 0.96;

interface DocPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** ID do produto dono do documento. */
  produtoId: number;
  codigo: string;
  descricao: string;
  temPasta: boolean;
  temDocumento: boolean;
  /** Extensão do documento a exibir (padrão "pdf"). */
  extensao?: string;
}

export function DocPreviewDialog({
  open,
  onOpenChange,
  produtoId,
  codigo,
  descricao,
  temPasta,
  temDocumento,
  extensao = 'pdf',
}: DocPreviewDialogProps) {
  const ehPdf = extensao.toLowerCase() === 'pdf';

  const pdfToolbar = useDocPreviewStore((s) => s.pdfToolbar);
  const setPdfToolbar = useDocPreviewStore((s) => s.setPdfToolbar);
  const modalWidth = useDocPreviewStore((s) => s.modalWidth);
  const modalHeight = useDocPreviewStore((s) => s.modalHeight);
  const setModalSize = useDocPreviewStore((s) => s.setModalSize);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; w: number; h: number; axis: 'both' | 'x' | 'y' } | null>(null);
  const sizeRef = useRef<{ w: number; h: number } | null>(null);

  // Tamanho controlado por estado (largura e altura via style). null = usa o CSS.
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  const base = documentoUrl(produtoId, extensao);
  const fragmento = pdfToolbar ? '#page=1&view=FitH' : '#toolbar=0&navpanes=0&page=1&view=FitH';

  const abrirNovaAba = () => window.open(base, '_blank', 'noopener,noreferrer');

  // Aplica o tamanho salvo quando o modal abre.
  useEffect(() => {
    if (!open) return;
    const inicial = modalWidth && modalHeight ? { w: modalWidth, h: modalHeight } : null;
    sizeRef.current = inicial;
    setSize(inicial);
    // Só na abertura: não reaplica enquanto arrasta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Redimensionamento pelo canto. O modal é centralizado com translate(-50%), então
  // o canto se move à metade do crescimento; compensa-se com fator 2 pra seguir o cursor.
  const onDown = (axis: 'both' | 'x' | 'y') => (e: React.PointerEvent) => {
    const el = contentRef.current;
    if (!el) return;
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY, w: el.offsetWidth, h: el.offsetHeight, axis };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const w = d.axis === 'y' ? d.w : Math.min(maxW(), Math.max(MIN_W, d.w + 2 * (e.clientX - d.x)));
    const h = d.axis === 'x' ? d.h : Math.min(maxH(), Math.max(MIN_H, d.h + 2 * (e.clientY - d.y)));
    const ns = { w, h };
    sizeRef.current = ns;
    setSize(ns);
  };

  const onUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    if (sizeRef.current) setModalSize(sizeRef.current.w, sizeRef.current.h);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        style={size ? { width: size.w, height: size.h, maxWidth: '96vw', maxHeight: '96vh' } : undefined}
        className="flex h-[85vh] max-h-[96vh] min-h-80 w-[min(900px,92vw)] min-w-105 max-w-[96vw] flex-col gap-0 overflow-hidden p-0"
      >
        {/* Faixa fina: toggle da barra do PDF + fechar */}
        <div className="flex shrink-0 items-center justify-end gap-1 border-b px-2 py-1.5">
          {temDocumento && ehPdf && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setPdfToolbar(!pdfToolbar)}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded transition-colors ${pdfToolbar
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                >
                  <PanelTop className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{pdfToolbar ? 'Ocultar barra do PDF' : 'Mostrar barra do PDF'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          <DialogClose asChild>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>

        {/* Documento: ocupa todo o espaço restante */}
        <div className="min-h-0 flex-1 bg-white p-2 dark:bg-slate-950">
          {temDocumento ? (
            ehPdf ? (
              <iframe
                key={`${produtoId}-${extensao}-${pdfToolbar}`}
                src={`${base}${fragmento}`}
                title={`Documento ${codigo}`}
                className="block h-full w-full border-0"
              />
            ) : (
              <img
                src={base}
                alt={`Documento ${codigo}`}
                className="mx-auto max-h-full max-w-full object-contain"
              />
            )
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <FileX2 className="h-9 w-9 text-slate-300" />
              <span className="text-xs">Sem documento</span>
            </div>
          )}
        </div>

        {/* Rodapé: código + ações na mesma linha; descrição embaixo */}
        <div className="shrink-0 border-t px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="min-w-0 truncate font-mono text-base font-bold">{codigo}</DialogTitle>
            <div className="flex shrink-0 items-center gap-1">
              <DocButtons
                produtoId={produtoId}
                temPasta={temPasta}
                temDocumento={temDocumento}
                extensao={extensao}
                size="md"
              />
              {temDocumento && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={abrirNovaAba}
                      className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <ExternalLink className="h-4.5 w-4.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Abrir em nova aba</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground line-clamp-2">{descricao}</p>
        </div>

        {/* Puxadores de redimensionar (aparecem ao passar o mouse) */}
        {/* Direita: só largura */}
        <div
          onPointerDown={onDown('x')}
          onPointerMove={onMove}
          onPointerUp={onUp}
          title="Arraste para a largura"
          style={{ touchAction: 'none' }}
          className="absolute bottom-4 right-0 top-0 z-20 w-1.5 cursor-ew-resize bg-transparent transition-colors hover:bg-blue-400/40"
        />
        {/* Base: só altura */}
        <div
          onPointerDown={onDown('y')}
          onPointerMove={onMove}
          onPointerUp={onUp}
          title="Arraste para a altura"
          style={{ touchAction: 'none' }}
          className="absolute bottom-0 left-0 right-4 z-20 h-1.5 cursor-ns-resize bg-transparent transition-colors hover:bg-blue-400/40"
        />
        {/* Canto: largura e altura */}
        <div
          onPointerDown={onDown('both')}
          onPointerMove={onMove}
          onPointerUp={onUp}
          title="Arraste para redimensionar"
          style={{ touchAction: 'none' }}
          className="group/resize absolute bottom-0 right-0 z-30 flex h-4 w-4 cursor-nwse-resize items-end justify-end p-0.5 text-slate-400"
        >
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover/resize:opacity-100">
            <path d="M9 1 L1 9 M9 5 L5 9" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
        </div>
      </DialogContent>
    </Dialog>
  );
}
