/**
 * TabUnderConstruction.tsx - Placeholder para páginas não implementadas
 * 
 * Exibido quando uma aba é aberta mas o componente não está registrado.
 */

import { Construction } from 'lucide-react';

interface TabUnderConstructionProps {
    type: string;
}

export function TabUnderConstruction({ type }: TabUnderConstructionProps) {
    return (
        <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                    <Construction className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Página em construção
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Esta funcionalidade ainda não foi implementada.
                </p>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-slate-600 dark:text-slate-400">
                    {type}
                </code>
            </div>
        </div>
    );
}