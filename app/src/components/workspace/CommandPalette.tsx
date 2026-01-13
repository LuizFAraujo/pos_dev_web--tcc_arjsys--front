/**
 * CommandPalette.tsx - Paleta de comandos global
 * 
 * Busca rápida de páginas do sistema com teclado.
 * Acessível via Ctrl+K ou click no campo de busca do Header.
 * 
 * Funcionalidades:
 * - Busca por nome de página
 * - Navegação por teclado (setas, Enter)
 * - Agrupamento por categoria
 * - Integração com Registry Pattern
 * - Abre aba ao selecionar
 */

import { useState, useMemo } from 'react';
import { Search, FileText } from 'lucide-react';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@ui/command';
import { useTabsStore } from '@stores';
import { getAllCategories } from '@/registries';
import type { TabType } from '@/types/tab.types';

interface CommandPaletteProps {
    /** Se o dialog está aberto */
    open: boolean;

    /** Callback ao fechar */
    onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const openTab = useTabsStore((state) => state.openTab);

    /**
     * Busca todas as páginas disponíveis agrupadas por categoria
     */
    const allPages = useMemo(() => {
        const categories = getAllCategories();

        return Object.entries(categories).map(([categoryId, categoryTabs]) => {
            const items = Object.entries(categoryTabs).map(([type, config]) => ({
                type: type as TabType,
                title: config?.defaultTitle || type,
                icon: config?.icon || FileText,
                category: categoryId,
            }));

            return {
                category: categoryId,
                items,
            };
        }).filter(group => group.items.length > 0);
    }, []);

    /**
     * Filtra páginas baseado na busca
     */
    const filteredPages = useMemo(() => {
        if (!search) return allPages;

        const searchLower = search.toLowerCase();

        return allPages.map((group) => ({
            ...group,
            items: group.items.filter((item) =>
                item.title.toLowerCase().includes(searchLower)
            ),
        })).filter(group => group.items.length > 0);
    }, [allPages, search]);

    /**
     * Abre aba e fecha o dialog
     */
    const handleSelect = (type: TabType, title: string) => {
        openTab(type, title);
        onOpenChange(false);
        setSearch('');
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput
                placeholder="Buscar páginas..."
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                <CommandEmpty>
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Search className="h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Nenhuma página encontrada
                        </p>
                    </div>
                </CommandEmpty>

                {filteredPages.map((group) => (
                    <CommandGroup key={group.category} heading={group.category.toUpperCase()}>
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <CommandItem
                                    key={item.type}
                                    value={item.title}
                                    onSelect={() => handleSelect(item.type, item.title)}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                ))}
            </CommandList>
        </CommandDialog>
    );
}