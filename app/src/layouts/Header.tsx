/**
 * Header.tsx - Barra superior fixa do sistema
 * 
 * Header principal exibido no topo de todas as páginas do sistema.
 * Integrado com stores para funcionalidades completas.
 * 
 * Estrutura:
 * - Logo + Título (esquerda) - clicável para /app
 * - Busca (centro) - abre Command Palette (Ctrl+K)
 * - Botões de ação (direita):
 *   - Settings: abre RightSidebar
 *   - Notifications: badge com contador
 *   - Sessions: sessões ativas
 *   - Stats: estatísticas
 *   - Dark Mode: toggle tema
 *   - User Menu: dropdown com perfil e logout
 * 
 * Funcionalidades:
 * - Integração com rightSidebarStore
 * - Integração com themeStore
 * - Links funcionais
 * - Placeholders para Command Palette e Logout (Fases 4.4 e 6)
 */


import {
    Sparkles, Search, Settings, Bell, Clock,
    BarChart3, User, LogOut, Moon, Sun
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useRightSidebarStore, useThemeStore } from '@stores';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@ui/avatar';
import { Badge } from '@ui/badge';

export function Header() {
    const openRightSidebar = useRightSidebarStore((state) => state.open);
    const darkMode = useThemeStore((state) => state.darkMode);
    const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

    /**
     * Abre Command Palette (será implementado na 4.4)
     */
    const handleSearchClick = () => {
        console.log('Command Palette (Ctrl+K) - Será implementado na Fase 4.4');
    };

    /**
     * Simula logout (será implementado na Fase 6)
     */
    const handleLogout = () => {
        console.log('Logout - Será implementado na Fase 6');
    };

    return (
        <header className="h-16 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
            <div className="flex h-full items-center justify-between px-4">
                {/* Logo + Título */}
                <Link to="/app" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
                </Link>

                {/* Área Central - Busca */}
                <div className="flex-1 max-w-md mx-8">
                    <button
                        onClick={handleSearchClick}
                        className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 flex items-center px-3 gap-2 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                    >
                        <Search className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-400 flex-1 text-left">
                            Buscar...
                        </span>
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </button>
                </div>

                {/* Botões Direita */}
                <div className="flex items-center gap-2">
                    {/* Settings */}
                    <button
                        onClick={() => openRightSidebar('settings')}
                        className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                        title="Configurações"
                    >
                        <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>

                    {/* Notifications */}
                    <button
                        onClick={() => openRightSidebar('notifications')}
                        className="relative h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                        title="Notificações"
                    >
                        <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
                            3
                        </Badge>
                    </button>

                    {/* Sessions */}
                    <button
                        onClick={() => openRightSidebar('sessions')}
                        className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                        title="Sessões"
                    >
                        <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>

                    {/* Stats */}
                    <button
                        onClick={() => openRightSidebar('stats')}
                        className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                        title="Estatísticas"
                    >
                        <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                        title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
                    >
                        {darkMode ? (
                            <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        ) : (
                            <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        )}
                    </button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <Avatar className="h-7 w-7">
                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                                        US
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Usuário Sistema</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        usuario@arjsys.com
                                    </span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openRightSidebar('settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Configurações</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sair</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}