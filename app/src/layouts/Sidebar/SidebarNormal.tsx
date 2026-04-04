/**
 * SidebarNormal.tsx — Modo normal (240px, lista completa)
 *
 * Tooltip condicional nos itens via SidebarItemButton.
 * Sem TooltipProvider do shadcn.
 */

import { useMemo, useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/shared/AppTooltip';
import { Pin, ChevronRight, ChevronsRight, ChevronsDown, Search, X, Star, Clock, Trash2 } from 'lucide-react';
import { useTabsStore, useSidebarStore, useFavoritesStore, useRecentsStore } from '@stores';
import { getTabsByCategory } from '@/registries';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui/accordion';
import { SidebarItemButton } from './SidebarItemButton';
import { CATEGORIES } from './constants';

export function SidebarNormal() {
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const openTab = useTabsStore((state) => state.openTab);

  const isPinned = useSidebarStore((state) => state.isPinned);
  const togglePin = useSidebarStore((state) => state.togglePin);

  const favorites = useFavoritesStore((state) => state.favorites);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  const recents = useRecentsStore((state) => state.recents);
  const clearRecents = useRecentsStore((state) => state.clearRecents);

  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const tabCountByType = useMemo(() => {
    const counts: Record<string, number> = {};
    tabs.forEach((tab) => { counts[tab.type] = (counts[tab.type] || 0) + 1; });
    return counts;
  }, [tabs]);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeTabType = activeTab?.type;

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return CATEGORIES.map(cat => ({ ...cat, items: getTabsByCategory(cat.id) }));
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

  const accordionValue = useMemo(() => {
    if (searchTerm.trim()) return filteredCategories.map(cat => cat.id);
    return openAccordions;
  }, [searchTerm, filteredCategories, openAccordions]);

  const handleOpenTab = (type: string, title: string) => {
    openTab(type as any, title);
  };

  const handleCollapseAll = () => setOpenAccordions([]);

  const handleExpandAll = () => {
    const allIds: string[] = [];
    if (favorites.length > 0) allIds.push('favorites');
    if (recents.length > 0) allIds.push('recents');
    filteredCategories.forEach(cat => {
      if (Object.keys(cat.items).length > 0) allIds.push(cat.id);
    });
    setOpenAccordions(allIds);
  };

  return (
    <aside className="w-60 border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out">
      {/* Subheader */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Menu</h2>
        <div className="flex items-center gap-1">

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={togglePin}
                className={`h-7 w-7 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors ${isPinned ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                <Pin className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>{isPinned ? 'Desafixar menu' : 'Fixar menu'}</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleCollapseAll}
                className="h-7 w-7 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Recolher todos</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleExpandAll}
                className="h-7 w-7 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-600 dark:text-slate-400">
                <ChevronsDown className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom"><p>Expandir todos</p></TooltipContent>
          </Tooltip>

        </div>
      </div>

      {/* Busca */}
      <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" name="sidebar-search" autoComplete="off" placeholder="Buscar..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <Accordion type="multiple" className="w-full" value={accordionValue} onValueChange={setOpenAccordions}>

          {/* FAVORITOS */}
          {favorites.length > 0 && (
            <AccordionItem value="favorites" className="border-none">
              <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors [&[data-state]>svg]:hidden [&>div>svg]:data-[state=open]:rotate-90">
                <div className="flex items-center gap-2 w-full">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                  <span className="flex-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 text-left">Favoritos</span>
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
                    const openCount = tabCountByType[favType] || 0;

                    return (
                      <div key={favType} className="group flex items-center gap-1">
                        <SidebarItemButton
                          title={config.defaultTitle}
                          isActive={favType === activeTabType}
                          icon={ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0" />}
                          badge={openCount > 0 ? <span className="text-xs text-slate-400">({openCount})</span> : undefined}
                          onClick={() => handleOpenTab(favType, config.defaultTitle)}
                        />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => removeFavorite(favType)}
                              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p>Remover dos favoritos</p></TooltipContent>
                        </Tooltip>

                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* RECENTES */}
          {recents.length > 0 && (
            <AccordionItem value="recents" className="border-none">
              <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors [&[data-state]>svg]:hidden [&>div>svg]:data-[state=open]:rotate-90 group">
                <div className="flex items-center gap-2 w-full">
                  <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                  <span className="flex-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 text-left">Recentes</span>
                  <span className="text-xs text-slate-400 mr-1">({recents.length})</span>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={(e) => { e.stopPropagation(); clearRecents(); }}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>Limpar histórico</p></TooltipContent>
                  </Tooltip>

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
                    const openCount = tabCountByType[recentType] || 0;
                    const isFav = isFavorite(recentType);

                    return (
                      <div key={recentType} className="group flex items-center gap-1">
                        <SidebarItemButton
                          title={config.defaultTitle}
                          isActive={recentType === activeTabType}
                          icon={ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0" />}
                          badge={openCount > 0 ? <span className="text-xs text-slate-400">({openCount})</span> : undefined}
                          onClick={() => handleOpenTab(recentType, config.defaultTitle)}
                        />

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => isFav ? removeFavorite(recentType) : addFavorite(recentType)}
                              className={`p-1 rounded transition-colors ${isFav
                                ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100'
                                }`}>
                              <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-yellow-500' : ''}`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent><p>{isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</p></TooltipContent>
                        </Tooltip>

                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* CATEGORIAS */}
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            const tabEntries = Object.entries(category.items);

            if (tabEntries.length === 0) {
              return (
                <div key={category.id} className="mb-2">
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-50 cursor-not-allowed">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span className="flex-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{category.label}</span>
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
                    <span className="flex-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 text-left">{category.label}</span>
                    <span className="text-xs text-slate-400 mr-1">({tabEntries.length})</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-1">
                  <div className="ml-4 space-y-1">
                    {tabEntries.map(([type, config]) => {
                      if (!config) return null;
                      const ItemIcon = config.icon;
                      const openCount = tabCountByType[type] || 0;

                      return (
                        <div key={type} className="group flex items-center gap-1">
                          <SidebarItemButton
                            title={config.defaultTitle}
                            isActive={type === activeTabType}
                            icon={ItemIcon && <ItemIcon className="h-3.5 w-3.5 shrink-0" />}
                            badge={openCount > 0 ? <span className="text-xs text-slate-400">({openCount})</span> : undefined}
                            onClick={() => handleOpenTab(type, config.defaultTitle)}
                          />

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button onClick={() => isFavorite(type) ? removeFavorite(type) : addFavorite(type)}
                                className={`p-1 rounded transition-colors ${isFavorite(type)
                                  ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                                  : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100'
                                  }`}>
                                <Star className={`h-3.5 w-3.5 ${isFavorite(type) ? 'fill-yellow-500' : ''}`} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isFavorite(type) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</p></TooltipContent>
                          </Tooltip>

                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {searchTerm && filteredCategories.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nenhum resultado encontrado para "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
