/**
 * Sidebar.tsx - Menu lateral esquerdo do sistema
 * 
 * Menu de navegação principal integrado com stores e registry.
 * Busca automaticamente os items de cada categoria do registry.
 * Integrado com tabsStore para abrir abas ao clicar.
 * 
 * Funcionalidades:
 * - Categorias expansíveis (Accordion)
 * - Click abre aba no workspace
 * - Busca items automaticamente do registry
 * - Contador de abas abertas por tipo
 * - 3 modos: normal (240px), compact (64px), closed (0px)
 * - Pin: fixar sidebar sempre visível
 * - Comportamento toggle (hambúrguer no Header):
 *   - Pinado: normal ↔ compact (ícones)
 *   - Não pinado: normal ↔ closed (oculto)
 * - Tooltips no modo compact
 * - Transições suaves (300ms)
 * 
 * TODO Fase 5.x:
 * - Implementar botões expand/collapse all accordions
 */

import { useMemo } from 'react';
import { ChevronRight, Users, Package, Truck, ShoppingCart, Wrench, Pin, ChevronsRight, ChevronsDown } from 'lucide-react';
import { useTabsStore, useSidebarStore } from '@stores';
import { getTabsByCategory } from '@/registries';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';

// Categorias do sistema
const CATEGORIES = [
    { id: 'cadastros', label: 'CADASTROS', icon: Users },
    { id: 'vendas', label: 'VENDAS', icon: ShoppingCart },
    { id: 'producao', label: 'PRODUÇÃO', icon: Package },
    { id: 'compras', label: 'COMPRAS', icon: Truck },
    { id: 'engenharia', label: 'ENGENHARIA', icon: Wrench },
] as const;

export function Sidebar() {
    const tabs = useTabsStore((state) => state.tabs);
    const activeTabId = useTabsStore((state) => state.activeTabId);
    const openTab = useTabsStore((state) => state.openTab);

    const mode = useSidebarStore((state) => state.mode);
    const isPinned = useSidebarStore((state) => state.isPinned);
    const togglePin = useSidebarStore((state) => state.togglePin);

    // Conta quantas abas de cada tipo estão abertas
    const tabCountByType = useMemo(() => {
        const counts: Record<string, number> = {};
        tabs.forEach((tab) => {
            counts[tab.type] = (counts[tab.type] || 0) + 1;
        });
        return counts;
    }, [tabs]);

    // Pega aba ativa para highlight
    const activeTab = tabs.find((t) => t.id === activeTabId);
    const activeTabType = activeTab?.type;

    /**
     * Handler para abrir aba
     */
    const handleOpenTab = (type: string, title: string) => {
        openTab(type as any, title);
    };

    /**
     * Placeholder para collapse all accordions (TODO: Fase 5.x)
     */
    const handleCollapseAll = () => {
        console.log('Collapse all accordions - Será implementado na Fase 5.x');
    };

    /**
     * Placeholder para expand all accordions (TODO: Fase 5.x)
     */
    const handleExpandAll = () => {
        console.log('Expand all accordions - Será implementado na Fase 5.x');
    };

    // Modo closed (oculto)
    if (mode === 'closed') {
        return <aside className="w-0 overflow-hidden transition-all duration-300 ease-in-out" />;
    }

    // Modo compact (64px - só ícones)
    if (mode === 'compact') {
        return (



            <aside className="w-16 border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out">

                {/* <div className="h-16 border-b border-slate-200 dark:border-slate-800" /> */}

                {/* Categorias com tooltips */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <TooltipProvider delayDuration={300}>
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
                    </TooltipProvider>
                </div>
            </aside>
        );
    }

    // Modo normal (240px)
    return (
        <aside className="w-60 border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out">
            {/* Header vazio (alinha com Header principal) */}
            {/* <div className="h-16 border-b border-slate-200 dark:border-slate-800" /> */}

            {/* Subheader com botões */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Menu
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={togglePin}
                        className={`h-7 w-7 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors ${isPinned
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-600 dark:text-slate-400'
                            }`}
                        title={isPinned ? 'Desafixar menu' : 'Fixar menu'}
                    >
                        <Pin className="h-4 w-4" />
                    </button>
                    {/* Botão Collapse All */}
                    <button
                        onClick={handleCollapseAll}
                        className="h-7 w-7 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400"
                        title="Recolher todos"
                    >
                        <ChevronsRight className="h-4 w-4" />  {/* ← Setas duplas direita */}
                    </button>
                    {/* Botão Expand All */}
                    <button
                        onClick={handleExpandAll}
                        className="h-7 w-7 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400"
                        title="Expandir todos"
                    >
                        <ChevronsDown className="h-4 w-4" />  {/* ← Setas duplas baixo */}
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2">
                <Accordion type="multiple" className="w-full">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const categoryTabs = getTabsByCategory(category.id);
                        const tabEntries = Object.entries(categoryTabs);

                        // Se não tem items, mostra desabilitado
                        if (tabEntries.length === 0) {
                            return (
                                <div key={category.id} className="mb-2">
                                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-50 cursor-not-allowed">
                                        <Icon className="h-4 w-4 text-slate-400" />
                                        <span className="flex-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                                            {category.label}
                                        </span>
                                        <span className="text-xs text-slate-400">(0)</span>
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <AccordionItem key={category.id} value={category.id} className="border-none">
                                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors [&[data-state=open]>svg]:rotate-90">
                                    <div className="flex items-center gap-2 flex-1">
                                        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                                        <span className="flex-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 text-left">
                                            {category.label}
                                        </span>
                                        <span className="text-xs text-slate-400">({tabEntries.length})</span>
                                    </div>
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200" />
                                </AccordionTrigger>

                                <AccordionContent className="pb-0 pt-1">
                                    <div className="ml-6 space-y-1">
                                        {tabEntries.map(([type, config]) => {
                                            if (!config) return null;

                                            const ItemIcon = config.icon;
                                            const isActive = type === activeTabType;
                                            const openCount = tabCountByType[type] || 0;

                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => handleOpenTab(type, config.defaultTitle)}
                                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${isActive
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0" />}
                                                    <span className="flex-1 truncate">{config.defaultTitle}</span>
                                                    {openCount > 0 && (
                                                        <span className="text-xs text-slate-400">({openCount})</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </div>
        </aside>
    );
}