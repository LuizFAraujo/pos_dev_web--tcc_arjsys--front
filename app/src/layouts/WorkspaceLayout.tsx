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
 * - CommandPalette busca global (Ctrl+K)
 * 
 * Atalhos de teclado:
 * - Ctrl+K ou Cmd+K: Abre Command Palette
 * - Ctrl+Shift+T: Reabre última aba fechada
 */

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { RightSidebar } from './RightSidebar';
import { ConfirmCloseDialog } from '@/components/workspace/ConfirmCloseDialog';
import { CommandPalette } from '@/components/workspace/CommandPalette';
import { SettingsContent } from '@/components/sidebars/SettingsContent';
import { NotificationsContent } from '@/components/sidebars/NotificationsContent';
import { SessionsContent } from '@/components/sidebars/SessionsContent';
import { StatsContent } from '@/components/sidebars/StatsContent';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTabsStore } from '@stores';

export function WorkspaceLayout() {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const reopenLastTab = useTabsStore((state) => state.reopenLastTab);

    // Registra atalhos de teclado globais
    useKeyboardShortcuts({
        onCommandPalette: () => setCommandPaletteOpen(true),
        onReopenTab: reopenLastTab,
    });

    return (
        <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
            <Header onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <MainContent />
            </div>

            {/* Modal de confirmação */}
            <ConfirmCloseDialog />

            {/* Command Palette */}
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
            />

            {/* RightSidebars com conteúdos */}
            <RightSidebar type="settings" title="Configurações">
                <SettingsContent />
            </RightSidebar>

            <RightSidebar type="notifications" title="Notificações">
                <NotificationsContent />
            </RightSidebar>

            <RightSidebar type="sessions" title="Sessões Ativas">
                <SessionsContent />
            </RightSidebar>

            <RightSidebar type="stats" title="Estatísticas">
                <StatsContent />
            </RightSidebar>
        </div>
    );
}