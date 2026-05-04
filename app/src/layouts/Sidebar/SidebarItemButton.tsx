/**
 * SidebarItemButton.tsx - Botão de item na sidebar com tooltip condicional
 *
 * Mostra tooltip via AppTooltip APENAS quando o texto está truncado.
 * Verifica truncamento no onMouseEnter (não no mount) pra garantir
 * que o layout já finalizou (scroll, accordion, etc).
 * Reutilizado em favoritos, recentes e categorias.
 */

import { useRef, useState, type ReactNode } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';

interface SidebarItemButtonProps {
  title: string;
  isActive: boolean;
  icon?: ReactNode;
  badge?: ReactNode;
  onClick: () => void;
}

export function SidebarItemButton({ title, isActive, icon, badge, onClick }: SidebarItemButtonProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  // Verifica se o texto está truncado quando o mouse entra no botão
  // Neste momento o layout já está finalizado (scroll visível, largura definitiva)
  const handleMouseEnter = () => {
    const el = spanRef.current;
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth);
  };

  const button = (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={`flex flex-1 min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${isActive
        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
    >
      {icon}
      <span ref={spanRef} className="flex-1 truncate">{title}</span>
      {badge}
    </button>
  );

  // Se texto não está truncado, renderiza botão sem tooltip
  if (!isTruncated) return button;

  // Se truncado, envolve com AppTooltip mostrando o título completo
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {button}
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="text-sm">{title}</p>
      </TooltipContent>
    </Tooltip>
  );
}