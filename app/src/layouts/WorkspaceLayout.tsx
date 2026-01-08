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
 * - RightSidebar deslizante (4 tipos)
 * - ConfirmCloseDialog modal global
 */

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { RightSidebar } from './RightSidebar';
import { ConfirmCloseDialog } from '@/components/workspace/ConfirmCloseDialog';

export function WorkspaceLayout() {
    return (
        <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
            <Header />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <MainContent />
            </div>

            {/* Modal de confirmação */}
            <ConfirmCloseDialog />

            {/* RightSidebars - Placeholder temporário */}
            <RightSidebar type="settings" title="Configurações">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Conteúdo de configurações será implementado na Fase 4.3
                </p>
            </RightSidebar>

            <RightSidebar type="notifications" title="Notificações">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Conteúdo de notificações será implementado na Fase 4.3
                </p>
            </RightSidebar>

            <RightSidebar type="sessions" title="Sessões Ativas">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Conteúdo de sessões será implementado na Fase 4.3
                </p>
            </RightSidebar>

            <RightSidebar type="stats" title="Estatísticas">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Conteúdo de estatísticas será implementado na Fase 4.3
                </p>
            </RightSidebar>
        </div>
    );
}