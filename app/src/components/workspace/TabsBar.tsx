/**
 * TabsBar.tsx - Barra horizontal de abas
 * 
 * Renderiza todas as abas abertas em uma barra horizontal.
 * Permite clicar para ativar e fechar abas.
 */

import { X } from 'lucide-react';
import { useTabsStore } from '@stores';
import { getTabConfig } from '@/registries';

export function TabsBar() {
    const tabs = useTabsStore((state) => state.tabs);
    const activeTabId = useTabsStore((state) => state.activeTabId);
    const setActiveTab = useTabsStore((state) => state.setActiveTab);
    const closeTab = useTabsStore((state) => state.closeTab);

    // Se não tem abas, não mostra a barra
    if (tabs.length === 0) {
        return null;
    }

    return (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center overflow-x-auto scrollbar-thin">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const config = getTabConfig(tab.type);
                const Icon = config?.icon;

                return (
                    <div
                        key={tab.id}
                        className={`group flex items-center gap-2 px-4 py-2 border-r border-slate-200 dark:border-slate-800 min-w-0 max-w-xs transition-colors ${isActive
                                ? 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        {/* Área clicável para ativar aba */}
                        <button
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2 min-w-0 flex-1"
                        >
                            {Icon && (
                                <Icon className={`shrink-0 h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                            )}
                            <span className="text-sm font-medium truncate">
                                {tab.title}
                            </span>
                            {tab.isDirty && (
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" title="Alterações não salvas" />
                            )}
                        </button>

                        {/* Botão fechar */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                closeTab(tab.id);
                            }}
                            className="shrink-0 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Fechar aba"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}