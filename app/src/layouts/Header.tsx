/**
 * Header.tsx - Barra superior fixa do sistema
 * 
 * Header principal que será exibido no topo de todas as páginas do sistema.
 * Contém logo, título, área de busca (placeholder) e botões de ação.
 * 
 * Estrutura:
 * - Logo + Título (esquerda)
 * - Espaço para busca (centro)
 * - Botões de ação (direita) - placeholders por enquanto
 */

import { Sparkles } from 'lucide-react';

export function Header() {
    return (
        <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
            <div className="flex h-full items-center justify-between px-4">
                {/* Logo + Título */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-slate-700 to-slate-900 shadow-md">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            ArjSys
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sistema ERP
                        </p>
                    </div>
                </div>

                {/* Área Central - Busca (placeholder) */}
                <div className="flex-1 max-w-md mx-8">
                    <div className="h-10 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 flex items-center px-3">
                        <span className="text-sm text-slate-400">
                            Buscar... (Ctrl+K)
                        </span>
                    </div>
                </div>

                {/* Botões Direita (placeholders) */}
                <div className="flex items-center gap-2">
                    <button className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                        <span className="text-xs text-slate-500">S</span>
                    </button>
                    <button className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                        <span className="text-xs text-slate-500">N</span>
                    </button>
                    <button className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                        <span className="text-xs text-slate-500">U</span>
                    </button>
                </div>
            </div>
        </header>
    );
}