/**
 * LoginPage.tsx - Página de login
 * 
 * Formulário de autenticação com validação básica.
 * Usa authStore para fazer login e redireciona para /app.
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@stores';
import { LogIn, Loader2, Factory } from 'lucide-react';

export function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handler do formulário de login
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        // Validação básica
        if (!email.trim()) {
            setError('Email é obrigatório');
            return;
        }

        if (!password.trim()) {
            setError('Senha é obrigatória');
            return;
        }

        if (password.length < 3) {
            setError('Senha deve ter pelo menos 3 caracteres');
            return;
        }

        try {
            setIsLoading(true);

            // Faz login (mock - aceita qualquer credencial)
            await login({ email, password });

            // Redireciona para /app
            navigate({ to: '/app' });
        } catch (err) {
            setError('Erro ao fazer login. Tente novamente.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Card de Login */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 px-8 py-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                            <Factory className="h-10 w-10 text-blue-600 dark:text-blue-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">ArjSYS</h1>
                    <p className="text-blue-100 dark:text-blue-200">Sistema de Gestão Industrial</p>
                </div>

                {/* Form */}
                <div className="px-8 py-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                            >
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
                            />
                        </div>

                        {/* Mensagem de Erro */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Botão Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Entrando...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5" />
                                    <span>Entrar</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info de Desenvolvimento */}
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                            🔓 Modo Desenvolvimento: Aceita qualquer email/senha
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    © 2025 ArjSYS - Sistema de Gestão Industrial
                </p>
            </div>
        </div>
    );
}