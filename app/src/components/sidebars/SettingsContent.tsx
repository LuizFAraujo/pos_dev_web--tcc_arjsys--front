/**
 * SettingsContent.tsx - Conteúdo da sidebar de configurações
 * 
 * Exibe opções de configuração do sistema:
 * - Seletor de tema de cores
 * - Toggle dark mode
 * - Opções de sidebar (futuro)
 */

import { Palette, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@stores';

const THEMES = [
    { id: 'default', name: 'Padrão', color: 'bg-slate-600' },
    { id: 'emerald', name: 'Esmeralda', color: 'bg-emerald-600' },
    { id: 'orange', name: 'Laranja', color: 'bg-orange-600' },
    { id: 'purple', name: 'Roxo', color: 'bg-purple-600' },
] as const;

export function SettingsContent() {
    const theme = useThemeStore((state) => state.theme);
    const darkMode = useThemeStore((state) => state.darkMode);
    const setTheme = useThemeStore((state) => state.setTheme);
    const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

    return (
        <div className="space-y-6">
            {/* Tema de Cores */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Tema de Cores
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${theme === t.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full ${t.color}`} />
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {t.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dark Mode */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    {darkMode ? (
                        <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    ) : (
                        <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    )}
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Modo Escuro
                    </h3>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${darkMode
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {darkMode ? 'Ativado' : 'Desativado'}
                    </span>
                    <div
                        className={`w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-300'
                            } relative`}
                    >
                        <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'
                                }`}
                        />
                    </div>
                </button>
            </div>

            {/* Info */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Outras configurações serão adicionadas em versões futuras.
                </p>
            </div>
        </div>
    );
}