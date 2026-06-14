/**
 * DocPreviewDialog.tsx - Modal de prévia ampliada do documento.
 *
 * Componente compartilhado (Produtos e BOM). Mostra o documento ORIGINAL, não a
 * miniatura: PDF embutido no visualizador nativo do navegador (rola, dá zoom,
 * começa na página 1) ou imagem em tamanho real. Rodapé com código + botões de
 * pasta/documento + descrição. Esc, ✕ e clique no fundo fecham (Radix já provê).
 */

import { FileX2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DocButtons } from '@/components/shared/DocButtons';
import { documentoUrl } from '@/lib/api';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(900px,92vw)] gap-0 overflow-hidden p-0">
        {/* Título exigido pelo Radix para acessibilidade; o código aparece no rodapé. */}
        <DialogTitle className="sr-only">Documento {codigo}</DialogTitle>

        {/* Área do documento original */}
        <div className="bg-white dark:bg-slate-950">
          {temDocumento ? (
            ehPdf ? (
              <iframe
                src={`${documentoUrl(produtoId, extensao)}#page=1&view=FitH`}
                title={`Documento ${codigo}`}
                className="block w-full border-0"
                style={{ height: '70vh' }}
              />
            ) : (
              <img
                src={documentoUrl(produtoId, extensao)}
                alt={`Documento ${codigo}`}
                className="mx-auto block max-h-[70vh] w-auto object-contain"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <FileX2 className="h-9 w-9 text-slate-300" />
              <span className="text-xs">Sem documento</span>
            </div>
          )}
        </div>

        {/* Rodapé: código + ações + descrição */}
        <div className="border-t bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-sm font-bold">{codigo}</span>
            <DocButtons
              produtoId={produtoId}
              temPasta={temPasta}
              temDocumento={temDocumento}
              extensao={extensao}
              size="md"
            />
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{descricao}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
