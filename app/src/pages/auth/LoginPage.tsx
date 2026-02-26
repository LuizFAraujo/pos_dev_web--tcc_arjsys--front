/**
 * LoginPage.tsx - Página de login com API real
 *
 * POST /api/admin/Auth/login com { usuario, senha }
 */

import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@stores';
import { LogIn, Loader2, Factory } from 'lucide-react';
import { ApiError } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!usuario.trim()) {
      setError('Usuário é obrigatório');
      return;
    }

    if (!senha.trim()) {
      setError('Senha é obrigatória');
      return;
    }

    try {
      setIsLoading(true);
      await login({ usuario, senha });
      navigate({ to: '/app' });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'Usuário ou senha inválidos' : err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
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
            {/* Usuário */}
            <div>
              <label
                htmlFor="usuario"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Usuário
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit */}
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
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          © 2025 ArjSYS - Sistema de Gestão Industrial
        </p>
      </div>
    </div>
  );
}
