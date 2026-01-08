/**
 * WorkspaceContent.tsx - Renderizador de conteúdo das abas
 * 
 * Renderiza dinamicamente o componente da aba ativa.
 * Busca a configuração no Registry e renderiza o componente correspondente.
 */

import { useTabsStore } from '@stores';
import { getTabConfig } from '@/registries';
import { EmptyWorkspace } from './EmptyWorkspace';
import { TabUnderConstruction } from './TabUnderConstruction';
import { TabContainer } from './TabContainer';

export function WorkspaceContent() {
    const tabs = useTabsStore((state) => state.tabs);
    const activeTabId = useTabsStore((state) => state.activeTabId);

    // Pega a aba ativa
    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    // Se não tem abas abertas
    if (!activeTab) {
        return <EmptyWorkspace />;
    }

    // Busca a configuração da aba no registry
    const tabConfig = getTabConfig(activeTab.type);

    // Se não encontrou configuração (página não implementada)
    if (!tabConfig) {
        return (
            <TabContainer tabId={activeTab.id}>
                <TabUnderConstruction tabType={activeTab.type} />
            </TabContainer>
        );
    }

    // Renderiza o componente da aba
    const Component = tabConfig.component;

    return (
        <TabContainer tabId={activeTab.id}>
            <Component />
        </TabContainer>
    );
}