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
 * - Campo de busca em tempo real
 * - Sistema de favoritos com accordion
 * - Sistema de recentes com histórico (limite 10)
 * - Tooltips em itens truncados
 * - Contador de abas abertas por tipo
 * - 3 modos: normal (240px), compact (64px), closed (0px)
 * - Pin: fixar sidebar sempre visível
 * - Comportamento toggle (hambúrguer no Header):
 *   - Pinado: normal ↔ compact (ícones)
 *   - Não pinado: normal ↔ closed (oculto)
 * - Tooltips no modo compact
 * - Transições suaves (300ms)
 * 
 * TODO:
 * - Implementar botões expand/collapse all accordions
 */

import { useMemo, useState } from 'react';
import { Users, Package, Truck, ShoppingCart, Wrench, Pin, ChevronRight, ChevronsRight, ChevronsDown, FileCode2, Search, X, Star, Clock, Trash2 } from 'lucide-react';
import { useTabsStore, useSidebarStore, useFavoritesStore, useRecentsStore } from '@stores';
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
    { id: 'modelos', label: 'PÁGINAS MODELO', icon: FileCode2 },
] as const;

export function Sidebar() {
    const tabs = useTabsStore((state) => state.tabs);
    const activeTabId = useTabsStore((state) => state.activeTabId);
    const openTab = useTabsStore((state) => state.openTab);

    const mode = useSidebarStore((state) => state.mode);
    const isPinned = useSidebarStore((state) => state.isPinned);
    const togglePin = useSidebarStore((state) => state.togglePin);

    // Favoritos
    const favorites = useFavoritesStore((state) => state.favorites);
    const addFavorite = useFavoritesStore((state) => state.addFavorite);
    const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
    const isFavorite = useFavoritesStore((state) => state.isFavorite);

    // Recentes
    const recents = useRecentsStore((state) => state.recents);
    const clearRecents = useRecentsStore((state) => state.clearRecents);

    // Estado de busca
    const [searchTerm, setSearchTerm] = useState('');
    const [openAccordions, setOpenAccordions] = useState<string[]>([]);

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

    // Filtra categorias e itens baseado no termo de busca
    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) {
            return CATEGORIES.map(cat => ({
                ...cat,
                items: getTabsByCategory(cat.id)
            }));
        }

        const term = searchTerm.toLowerCase();
        return CATEGORIES.map(cat => {
            const allItems = getTabsByCategory(cat.id);
            const items = Object.entries(allItems).filter(([_type, config]) =>
                config.defaultTitle.toLowerCase().includes(term)
            );
            return { ...cat, items: Object.fromEntries(items) };
        }).filter(cat => Object.keys(cat.items).length > 0);
    }, [searchTerm]);

    // Controlar quais accordions estão abertos
    const accordionValue = useMemo(() => {
        if (searchTerm.trim()) {
            // Se tem busca, abre categorias com resultados
            return filteredCategories.map(cat => cat.id);
        }
        // Se não tem busca, mantém os que estão abertos manualmente
        return openAccordions;
    }, [searchTerm, filteredCategories, openAccordions]);

    /**
     * Handler para abrir aba
     */
    const handleOpenTab = (type: string, title: string) => {
        openTab(type as any, title);
    };

    /**
     * Colapsa todos os accordions
     */
    const handleCollapseAll = () => {
        setOpenAccordions([]);
    };

    /**
     * Expande todos os accordions que têm conteúdo
     */
    const handleExpandAll = () => {
        const allIds: string[] = [];

        // Adiciona favoritos se tiver
        if (favorites.length > 0) {
            allIds.push('favorites');
        }

        // Adiciona recentes se tiver
        if (recents.length > 0) {
            allIds.push('recents');
        }

        // Adiciona todas as categorias que têm items
        filteredCategories.forEach(cat => {
            if (Object.keys(cat.items).length > 0) {
                allIds.push(cat.id);
            }
        });

        setOpenAccordions(allIds);
    };

    // Modo closed (oculto)
    if (mode === 'closed') {
        return <aside className="w-0 overflow-hidden transition-all duration-300 ease-in-out" />;
    }

    // Modo compact (64px - só ícones)
    if (mode === 'compact') {
        return (
            <aside className="w-16 border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out">
                {/* Categorias com tooltips */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
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
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                    {/* Botão Expand All */}
                    <button
                        onClick={handleExpandAll}
                        className="h-7 w-7 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400"
                        title="Expandir todos"
                    >
                        <ChevronsDown className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Campo de Busca */}
            <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        name="sidebar-search"
                        autoComplete="off"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                <TooltipProvider delayDuration={300}>
                    <Accordion
                        type="multiple"
                        className="w-full"
                        value={accordionValue}
                        onValueChange={setOpenAccordions}
                    >
                        {/* Seção FAVORITOS */}
                        {favorites.length > 0 && (
                            <AccordionItem value="favorites" className="border-none">
                                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors [&[data-state]>svg]:hidden [&>div>svg]:data-[state=open]:rotate-90">
                                    <div className="flex items-center gap-2 w-full">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                                        <span className="flex-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 text-left">
                                            Favoritos
                                        </span>
                                        <span className="text-xs text-slate-400 mr-1">({favorites.length})</span>
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200" />
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="pb-0 pt-1">
                                    <div className="ml-4 space-y-1">
                                        {favorites.map((favType) => {
                                            const config = CATEGORIES.flatMap(cat => Object.entries(getTabsByCategory(cat.id)))
                                                .find(([type]) => type === favType)?.[1];

                                            if (!config) return null;

                                            const ItemIcon = config.icon;
                                            const isActive = favType === activeTabType;
                                            const openCount = tabCountByType[favType] || 0;

                                            return (
                                                <div key={favType} className="group flex items-center gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => handleOpenTab(favType, config.defaultTitle)}
                                                                className={`flex flex-1 min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${isActive
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
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <p className="text-sm">{config.defaultTitle}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <button
                                                        onClick={() => removeFavorite(favType)}
                                                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Remover dos favoritos"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Seção RECENTES */}
                        {recents.length > 0 && (
                            <AccordionItem value="recents" className="border-none">
                                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors [&[data-state]>svg]:hidden [&>div>svg]:data-[state=open]:rotate-90 group">
                                    <div className="flex items-center gap-2 w-full">
                                        <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                                        <span className="flex-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 text-left">
                                            Recentes
                                        </span>
                                        <span className="text-xs text-slate-400 mr-1">({recents.length})</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearRecents();
                                            }}
                                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Limpar histórico de recentes"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200" />
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="pb-0 pt-1">
                                    <div className="ml-4 space-y-1">
                                        {recents.map((recentType) => {
                                            const config = CATEGORIES.flatMap(cat => Object.entries(getTabsByCategory(cat.id)))
                                                .find(([type]) => type === recentType)?.[1];

                                            if (!config) return null;

                                            const ItemIcon = config.icon;
                                            const isActive = recentType === activeTabType;
                                            const openCount = tabCountByType[recentType] || 0;
                                            const isFav = isFavorite(recentType);

                                            return (
                                                <div key={recentType} className="group flex items-center gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={() => handleOpenTab(recentType, config.defaultTitle)}
                                                                className={`flex flex-1 min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${isActive
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
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <p className="text-sm">{config.defaultTitle}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <button
                                                        onClick={() => isFav ? removeFavorite(recentType) : addFavorite(recentType)}
                                                        className={`p-1 rounded transition-colors ${isFav
                                                            ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                                            : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100'
                                                            }`}
                                                        title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                    >
                                                        <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-yellow-500' : ''}`} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Categorias normais */}
                        {filteredCategories.map((category) => {
                            const Icon = category.icon;
                            const tabEntries = Object.entries(category.items);

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
                                    <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors [&[data-state]>svg]:hidden [&>div>svg]:data-[state=open]:rotate-90">
                                        <div className="flex items-center gap-2 w-full">
                                            <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                                            <span className="flex-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 text-left">
                                                {category.label}
                                            </span>
                                            <span className="text-xs text-slate-400 mr-1">({tabEntries.length})</span>
                                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200" />
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="pb-0 pt-1">
                                        <div className="ml-4 space-y-1">
                                            {tabEntries.map(([type, config]) => {
                                                if (!config) return null;

                                                const ItemIcon = config.icon;
                                                const isActive = type === activeTabType;
                                                const openCount = tabCountByType[type] || 0;

                                                return (
                                                    <div key={type} className="group flex items-center gap-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={() => handleOpenTab(type, config.defaultTitle)}
                                                                    className={`flex flex-1 min-w-0 items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${isActive
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
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">
                                                                <p className="text-sm">{config.defaultTitle}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <button
                                                            onClick={() => isFavorite(type) ? removeFavorite(type) : addFavorite(type)}
                                                            className={`p-1 rounded transition-colors ${isFavorite(type)
                                                                ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                                                : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100'
                                                                }`}
                                                            title={isFavorite(type) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                        >
                                                            <Star className={`h-3.5 w-3.5 ${isFavorite(type) ? 'fill-yellow-500' : ''}`} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>

                    {/* Mensagem quando não há resultados */}
                    {searchTerm && filteredCategories.length === 0 && (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Nenhum resultado encontrado para "{searchTerm}"
                            </p>
                        </div>
                    )}
                </TooltipProvider>
            </div>
        </aside>
    );
}