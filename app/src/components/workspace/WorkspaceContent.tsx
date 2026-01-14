/**
 * WorkspaceContent.tsx - Renderizador dinâmico de conteúdo das abas
 * 
 * Renderiza o componente da aba ativa baseado no Registry Pattern.
 * Cada aba é uma instância completamente independente com key única.
 * 
 * Funcionalidades:
 * - Busca configuração no registry
 * - Renderiza componente dinamicamente
 * - Fallback para aba vazia ou em construção
 * - Isolamento total de estado via key prop
 * - Scroll isolado por aba
 */

import { useTabsStore } from '@stores';
import { getTabConfig } from '@/registries';
import { EmptyWorkspace } from './EmptyWorkspace';
import { TabUnderConstruction } from './TabUnderConstruction';

export function WorkspaceContent() {
    const tabs = useTabsStore((state) => state.tabs);
    const activeTabId = useTabsStore((state) => state.activeTabId);

    // Busca aba ativa
    const activeTab = tabs.find((tab) => tab.id === activeTabId);

    // Se não tem aba ativa, mostra workspace vazio
    if (!activeTab) {
        return <EmptyWorkspace />;
    }

    // Busca configuração da aba no registry
    const config = getTabConfig(activeTab.type);

    // Se não encontrou config, mostra em construção
    if (!config) {
        return <TabUnderConstruction type={String(activeTab.type)} />;
    }

    const PageComponent = config.component;

    // Renderiza com key única, tab como prop e scroll isolado
    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin p-2">
                <PageComponent key={activeTab.id} tab={activeTab} />
            </div>
        </div>
    );
}
