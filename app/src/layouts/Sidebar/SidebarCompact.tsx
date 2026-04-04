/**
 * SidebarCompact.tsx — Modo compact (64px, só ícones com tooltip)
 *
 * Tooltip via AppTooltip (delay centralizado).
 */

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { getTabsByCategory } from '@/registries';
import { CATEGORIES } from './constants';

export function SidebarCompact() {
  return (
    <aside className="w-16 border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out">
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const categoryTabs = getTabsByCategory(category.id);
          const tabEntries = Object.entries(categoryTabs);
          const hasItems = tabEntries.length > 0;

          return (
            <Tooltip key={category.id}>
              <TooltipTrigger asChild>
                <button
                  className={`w-full h-12 rounded-lg flex items-center justify-center transition-colors ${hasItems
                    ? 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'opacity-50 cursor-not-allowed'
                    }`}
                  disabled={!hasItems}
                >
                  <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold">{category.label}</p>
                <p className="text-xs text-slate-500">
                  {hasItems ? `${tabEntries.length} itens` : 'Vazio'}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </aside>
  );
}
