/**
 * AppTooltip.tsx - Wrapper do Tooltip com delay padrão
 *
 * Por padrão, tooltips aparecem após 1500ms (1.5s).
 * Usa no lugar de '@/components/ui/tooltip' em toda a aplicação.
 *
 * Uso básico:
 *   import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
 *
 *   <Tooltip>
 *     <TooltipTrigger><Button>...</Button></TooltipTrigger>
 *     <TooltipContent>Dica aqui</TooltipContent>
 *   </Tooltip>
 *
 * Delay customizado (sobrescreve o padrão):
 *   <Tooltip delayDuration={500}>
 *     <TooltipTrigger>...</TooltipTrigger>
 *     <TooltipContent>Aparece em 0.5s</TooltipContent>
 *   </Tooltip>
 */

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const DEFAULT_DELAY = 1200; // ms — tempo até o tooltip aparecer

function AppTooltip({ delayDuration = DEFAULT_DELAY, ...props }: React.ComponentProps<typeof Tooltip>) {
  return <Tooltip delayDuration={delayDuration} {...props} />;
}

export { AppTooltip as Tooltip, TooltipTrigger, TooltipContent };