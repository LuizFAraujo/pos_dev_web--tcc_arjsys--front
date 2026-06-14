/**
 * DocButtons.tsx - Botões de abrir pasta / abrir documento de um produto.
 *
 * Componente compartilhado, identificado pelo produtoId (serve card de Produtos,
 * modal de prévia e células da BOM). A ação de abrir continua sendo no servidor,
 * via store de produtos (abrirPasta / abrirDocumento), sem mudança de comportamento.
 *
 *   - extensao definida -> abre essa extensão direto.
 *   - extensao ausente  -> lista as extensões disponíveis num popover.
 *   - size 'sm' (padrão) -> grids e cards. size 'md' -> modal (ícones maiores).
 */

import { useState } from 'react';
import { FolderOpen, FileText, FileX2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';

interface DocButtonsProps {
  /** ID do produto dono dos documentos. */
  produtoId: number;
  /** Produto tem pasta de documentos. */
  temPasta: boolean;
  /** Produto tem documento cadastrado. */
  temDocumento: boolean;
  /** Se passada, abre direto essa extensão; senão lista as extensões num popover. */
  extensao?: string;
  /** Tamanho dos botões: 'sm' (padrão, grids/cards) ou 'md' (modal). */
  size?: 'sm' | 'md';
}

export function DocButtons({ produtoId, temPasta, temDocumento, extensao, size = 'sm' }: DocButtonsProps) {
  const abrirPasta = useProdutosStore((s) => s.abrirPasta);
  const extensoesDocumento = useProdutosStore((s) => s.extensoesDocumento);
  const abrirDocumento = useProdutosStore((s) => s.abrirDocumento);

  const [extOpen, setExtOpen] = useState(false);
  const [extensoes, setExtensoes] = useState<string[]>([]);

  if (!temPasta && !temDocumento) {
    return <span className="text-muted-foreground">-</span>;
  }

  const btnSize = size === 'md' ? 'h-8 w-8' : 'h-6 w-6';
  const icSize = size === 'md' ? 'h-4.5 w-4.5' : 'h-3.5 w-3.5';

  const handleAbrirPasta = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await abrirPasta(produtoId);
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao abrir pasta');
    }
  };

  const handleDocClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!temDocumento) return;

    // Extensão conhecida: abre direto.
    if (extensao) {
      try {
        await abrirDocumento(produtoId, extensao);
      } catch (err: any) {
        toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento');
      }
      return;
    }

    // Sem extensão: descobre as disponíveis e decide.
    try {
      const result = await extensoesDocumento(produtoId);
      const exts = result.extensoes || [];

      if (exts.length === 0) {
        toast.error('Nenhum documento encontrado.');
        return;
      }

      if (exts.length === 1) {
        await abrirDocumento(produtoId, exts[0]);
        return;
      }

      setExtensoes(exts);
      setExtOpen(true);
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao buscar extensões');
    }
  };

  const handleAbrirExt = async (ext: string) => {
    setExtOpen(false);
    try {
      await abrirDocumento(produtoId, ext);
    } catch (err: any) {
      toast.error(err?.body?.erro || err?.message || 'Erro ao abrir documento');
    }
  };

  return (
    <div className="flex items-center justify-center gap-0.5">
      {/* Abrir pasta */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleAbrirPasta}
            disabled={!temPasta}
            className={`inline-flex items-center justify-center ${btnSize} rounded transition-colors ${temPasta
              ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer'
              : 'text-muted-foreground/40 cursor-default'
              }`}
          >
            <FolderOpen className={icSize} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{temPasta ? 'Abrir pasta' : 'Sem pasta'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Abrir documento */}
      {extensao ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleDocClick}
              disabled={!temDocumento}
              className={`inline-flex items-center justify-center ${btnSize} rounded transition-colors ${temDocumento
                ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                : 'text-muted-foreground/50 cursor-default'
                }`}
            >
              {temDocumento
                ? <FileText className={icSize} />
                : <FileX2 className={icSize} />
              }
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{temDocumento ? 'Abrir documento' : temPasta ? 'Pasta sem documento' : 'Sem documento'}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <Popover open={extOpen} onOpenChange={setExtOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={handleDocClick}
                  disabled={!temDocumento}
                  className={`inline-flex items-center justify-center ${btnSize} rounded transition-colors ${temDocumento
                    ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                    : 'text-muted-foreground/50 cursor-default'
                    }`}
                >
                  {temDocumento
                    ? <FileText className={icSize} />
                    : <FileX2 className={icSize} />
                  }
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{temDocumento ? 'Abrir documento' : temPasta ? 'Pasta sem documento' : 'Sem documento'}</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-auto p-1" align="center">
            <div className="flex flex-col">
              <p className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">Extensão</p>
              {extensoes.map((ext) => (
                <button
                  key={ext}
                  type="button"
                  onClick={() => handleAbrirExt(ext)}
                  className="px-3 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors font-mono"
                >
                  .{ext}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
