/**
 * WorkspaceContent.tsx - Renderizador dinâmico de conteúdo das abas
 *
 * Renderiza TODAS as abas abertas, escondendo as inativas com display:none.
 * Preserva scroll, estado do DOM e foco entre trocas de aba.
 */

import { useTabsStore } from '@stores';
import { getTabConfig } from '@/registries';
import { EmptyWorkspace } from './EmptyWorkspace';
import { TabUnderConstruction } from './TabUnderConstruction';

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
                        <PageComponent tab={tab} />
                    </div>
                );
            })}
        </>
    );
}