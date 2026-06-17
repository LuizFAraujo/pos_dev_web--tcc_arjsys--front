/**
 * BomThumbControls.tsx - Toggle de miniaturas + controle TAM. da BOM.
 *
 * Vai na toolbar da BOM (flat e tree), imediatamente à esquerda da engrenagem.
 * Lê e grava no bomThumbsStore (compartilhado entre as duas visões).
 */

import { Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { useBomThumbsStore } from '@/stores/engenharia/bomThumbsStore';

const TAM_MIN = 40;
const TAM_MAX = 160;
const TAM_STEP = 10;

export function BomThumbControls() {
  const enabled = useBomThumbsStore((s) => s.enabled);
  const thumbHeight = useBomThumbsStore((s) => s.thumbHeight);
  const setEnabled = useBomThumbsStore((s) => s.setEnabled);
  const setThumbHeight = useBomThumbsStore((s) => s.setThumbHeight);

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 ${enabled ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : ''}`}
            onClick={() => setEnabled(!enabled)}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent><p>{enabled ? 'Ocultar miniaturas' : 'Mostrar miniaturas'}</p></TooltipContent>
      </Tooltip>

      {enabled && (
        <div className="flex h-8 items-center gap-2 rounded-md border border-input px-2">
          <label className="text-[11px] text-muted-foreground">TAM.</label>
          <input
            type="range"
            min={TAM_MIN}
            max={TAM_MAX}
            step={TAM_STEP}
            value={thumbHeight}
            onChange={(e) => setThumbHeight(+e.target.value)}
            className="w-24 accent-sky-500"
          />
          <span className="w-9 text-[11px] text-muted-foreground">{thumbHeight} px</span>
        </div>
      )}
    </div>
  );
}
