/**
 * WorkspaceContent.tsx - Renderizador dinâmico de conteúdo das abas
 *
 * Renderiza TODAS as abas abertas, escondendo as inativas com display:none.
 * Preserva scroll, estado do DOM e foco entre trocas de aba.
 *
 * Páginas são lazy: cada uma vira chunk separado e é baixada sob demanda.
 * Suspense envolve cada PageComponent pra mostrar fallback enquanto o chunk
 * carrega na primeira abertura.
 */

import { Suspense } from 'react';
import { useTabsStore } from '@stores';
import { getTabConfig } from '@/registries';
import { EmptyWorkspace } from './EmptyWorkspace';
import { TabUnderConstruction } from './TabUnderConstruction';

function PageFallback() {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Carregando página...</p>
            </div>
        </div>
    );
}

export function WorkspaceContent() {
    const tabs = useTabsStore((state) => state.tabs);
    const activeTabId = useTabsStore((state) => state.activeTabId);

    if (tabs.length === 0) {
        return <EmptyWorkspace />;
    }

    return (
        <>
            {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const config = getTabConfig(tab.type);

                if (!config) {
                    return (
                        <div key={tab.id} style={{ display: isActive ? 'flex' : 'none' }} className="flex-1 flex-col overflow-hidden">
                            <TabUnderConstruction type={String(tab.type)} />
                        </div>
                    );
                }

                const PageComponent = config.component;

                return (
                    <div key={tab.id} style={{ display: isActive ? 'flex' : 'none' }} className="flex-1 flex-col overflow-hidden">
                        <Suspense fallback={<PageFallback />}>
                            <PageComponent tab={tab} />
                        </Suspense>
                    </div>
                );
            })}
        </>
    );
}