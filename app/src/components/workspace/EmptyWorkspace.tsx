/**
 * EmptyWorkspace.tsx - Estado vazio do workspace
 * 
 * Exibido quando nenhuma aba está aberta.
 * Mostra mensagem de boas-vindas e instruções.
 */

import { Inbox } from 'lucide-react';

export function EmptyWorkspace() {
    return (
        <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Nenhuma aba aberta
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Selecione um item no menu lateral para começar a trabalhar.
                </p>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                    Dica: Use <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl+K</kbd> para busca rápida
                </div>
            </div>
        </div>
    );
}