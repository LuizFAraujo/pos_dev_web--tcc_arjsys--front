/**
 * NotFoundPage.tsx - Página de erro 404
 * 
 * Página exibida quando uma rota não é encontrada.
 * 
 * Funcionalidades:
 * - Erro 404 estilizado
 * - Mensagem amigável
 * - Botão para voltar ao workspace
 * - Animação sutil
 */

import { useNavigate } from '@tanstack/react-router';
import { Home, AlertCircle } from 'lucide-react';

export function NotFoundPage() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate({ to: '/app' });
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center px-4">
                {/* Ícone */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-2xl" />
                        <div className="relative bg-white dark:bg-slate-900 rounded-full p-6 border border-slate-200 dark:border-slate-800">
                            <AlertCircle className="h-16 w-16 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Código 404 */}
                <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    404
                </h1>

                {/* Mensagem */}
                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Página não encontrada
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                    A página que você está procurando não existe ou foi movida.
                </p>

                {/* Botão Voltar */}
                <button
                    onClick={handleGoHome}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg font-medium transition-colors"
                >
                    <Home className="h-4 w-4" />
                    <span>Voltar ao Workspace</span>
                </button>
            </div>
        </div>
    );
}