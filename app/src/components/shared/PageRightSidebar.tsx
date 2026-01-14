/**
 * PageRightSidebar.tsx - Sidebar lateral direito para páginas
 * 
 * Sidebar que aparece do lado direito, mas limitado à altura da página.
 * Diferente do RightSidebar global que ocupa a tela toda.
 * 
 * Funcionalidades:
 * - Abre/fecha com animação suave
 * - Click no backdrop fecha
 * - Tecla ESC fecha
 * - Altura limitada à área da página (não cobre navbar/header)
 */

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { usePageRightSidebarStore } from '@/stores/pageRightSidebarStore';

interface PageRightSidebarProps {
    /** Tipo do sidebar */
    type: 'settings' | 'info' | 'history' | 'help';

    /** Título do sidebar */
    title: string;

    /** Conteúdo do sidebar */
    children: ReactNode;
}

export function PageRightSidebar({ type, title, children }: PageRightSidebarProps) {
    const openSidebar = usePageRightSidebarStore((state) => state.openSidebar);
    const close = usePageRightSidebarStore((state) => state.close);

    const isOpen = openSidebar === type;

    // ESC fecha o sidebar
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, close]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={close}
            />

            {/* Sidebar */}
            <div className="absolute top-0 right-0 bottom-0 w-full sm:w-96 sm:max-w-96 bg-white dark:bg-slate-900 shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h2>
                    <button
                        onClick={close}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </>
    );
}