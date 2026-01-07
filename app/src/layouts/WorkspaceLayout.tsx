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
import { Sidebar } from './Sidebar';

export function WorkspaceLayout() {
    return (
        <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
            {/* Header Fixo */}
            <Header />

            {/* Container Principal: Sidebar + Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Esquerda */}
                <Sidebar />

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