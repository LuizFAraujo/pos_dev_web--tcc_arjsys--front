/**
 * MainContent.tsx - Área de conteúdo principal do sistema
 * 
 * Container principal que exibe TabsBar e WorkspaceContent.
 */

import { TabsBar } from '@/components/workspace/TabsBar';
import { WorkspaceContent } from '@/components/workspace/WorkspaceContent';

export function MainContent() {
    return (
        <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Barra de Abas */}
            <TabsBar />

            {/* Conteúdo da Aba Ativa */}
            <WorkspaceContent />
        </main>
    );
}