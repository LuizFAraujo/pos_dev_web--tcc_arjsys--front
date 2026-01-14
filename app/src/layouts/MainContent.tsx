/**
 * MainContent.tsx - Área central de conteúdo
 * 
 * Container principal que exibe TabsBar e WorkspaceContent.
 * Gerencia overflow para isolar scroll das páginas.
 */

import { TabsBar } from '@/components/workspace/TabsBar';
import { WorkspaceContent } from '@/components/workspace/WorkspaceContent';

export function MainContent() {
    return (
        <main className="flex flex-1 min-w-0 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
            <TabsBar />
            <WorkspaceContent />
        </main>
    );
}

