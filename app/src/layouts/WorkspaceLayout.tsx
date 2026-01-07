/**
 * WorkspaceLayout.tsx - Layout principal do workspace
 * 
 * Estrutura base do sistema com Header, Sidebar e área de conteúdo principal.
 * Este layout será usado em todas as páginas do sistema após o login.
 * 
 * Estrutura:
 * - Header fixo no topo (64px)
 * - Sidebar esquerda (240px, colapsável)
 * - MainContent área central (dinâmica)
 */

import { Header } from './Header';

export function WorkspaceLayout() {
    return (
        <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
            {/* Header Fixo */}
            <Header />

            {/* Container Principal: Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Esquerda */}
                <aside className="w-60 border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
                    <div className="p-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Sidebar Placeholder
                        </span>
                    </div>
                </aside>

                {/* Área de Conteúdo Principal */}
                <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div className="p-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            MainContent Placeholder
                        </span>
                    </div>
                </main>
            </div>
        </div>
    );
}