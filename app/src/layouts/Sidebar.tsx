/**
 * Sidebar.tsx - Menu lateral esquerdo do sistema
 * 
 * Menu de navegação principal com categorias de módulos.
 * Por enquanto apenas visual, sem funcionalidade de navegação.
 * 
 * Estrutura:
 * - Header com título "Menu"
 * - Categorias hardcoded (CADASTROS, VENDAS, PRODUÇÃO, COMPRAS, ENGENHARIA)
 * - Items de menu placeholder
 * - Largura fixa 240px
 */

import { ChevronRight, Users, Package, Truck, ShoppingCart, Wrench } from 'lucide-react';

// Categorias do sistema
const CATEGORIES = [
    { id: 'cadastros', label: 'CADASTROS', icon: Users },
    { id: 'vendas', label: 'VENDAS', icon: ShoppingCart },
    { id: 'producao', label: 'PRODUÇÃO', icon: Package },
    { id: 'compras', label: 'COMPRAS', icon: Truck },
    { id: 'engenharia', label: 'ENGENHARIA', icon: Wrench },
] as const;

export function Sidebar() {
    return (
        <aside className="w-60 border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Menu
                </h2>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-2">
                {/* Categorias */}
                {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                        <div key={category.id} className="mb-2">
                            {/* Category Header */}
                            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span className="flex-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                                    {category.label}
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                            </button>

                            {/* Placeholder Items (mostrar só no primeiro) */}
                            {category.id === 'cadastros' && (
                                <div className="ml-6 mt-1 space-y-1">
                                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                                        Item 1
                                    </button>
                                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                                        Item 2
                                    </button>
                                    <button className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                                        Item 3
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}