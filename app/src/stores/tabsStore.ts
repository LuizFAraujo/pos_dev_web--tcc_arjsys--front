/**
 * tabsStore.ts - Store de gerenciamento de abas
 * 
 * Gerencia o estado das abas abertas no workspace:
 * - Lista de abas abertas
 * - Aba ativa
 * - Histórico de abas fechadas (para reabrir com Ctrl+Shift+T)
 * - Funções de manipulação (abrir, fechar, ativar)
 */

import { create } from 'zustand';
// import type { Tab, TabType, TabMetadata } from '@types/tab.types';
import type { Tab, TabType, TabMetadata } from '@/types/tab.types';

interface TabsState {
    /** Lista de abas abertas */
    tabs: Tab[];

    /** ID da aba ativa */
    activeTabId: string | null;

    /** Histórico de abas fechadas (últimas 10) */
    closedHistory: Tab[];

    /** Aba pendente de confirmação para fechar */
    tabPendingClose: string | null;

    /** Abrir nova aba */
    openTab: (type: TabType, title: string, metadata?: TabMetadata) => void;

    /** Fechar aba por ID */
    closeTab: (tabId: string, force?: boolean) => void;

    /** Ativar aba por ID */
    setActiveTab: (tabId: string) => void;

    /** Reabrir última aba fechada */
    reopenLastTab: () => void;

    /** Definir aba pendente de confirmação */
    setTabPendingClose: (tabId: string | null) => void;

    /** Marcar aba como dirty */
    setTabDirty: (tabId: string, isDirty: boolean) => void;
}

export const useTabsStore = create<TabsState>((set, get) => ({
    tabs: [],
    activeTabId: null,
    closedHistory: [],
    tabPendingClose: null,

    openTab: (type, title, metadata) => {
        const newTab: Tab = {
            id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            isDirty: false,
            createdAt: Date.now(),
            lastAccessedAt: Date.now(),
        };

        set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
        }));
    },

    closeTab: (tabId, force = false) => {
        const { tabs } = get();
        const tabToClose = tabs.find((t) => t.id === tabId);

        if (!tabToClose) return;

        // Se tem alterações não salvas e não é force, marca como pendente
        if (tabToClose.isDirty && !force) {
            set({ tabPendingClose: tabId });
            return;
        }

        const { activeTabId } = get();
        const newTabs = tabs.filter((t) => t.id !== tabId);
        let newActiveTabId = activeTabId;

        // Se fechou a aba ativa, ativar a próxima
        if (activeTabId === tabId) {
            const closedIndex = tabs.findIndex((t) => t.id === tabId);
            if (newTabs.length > 0) {
                const newIndex = closedIndex >= newTabs.length ? newTabs.length - 1 : closedIndex;
                newActiveTabId = newTabs[newIndex]?.id || null;
            } else {
                newActiveTabId = null;
            }
        }

        set((state) => ({
            tabs: newTabs,
            activeTabId: newActiveTabId,
            closedHistory: [tabToClose, ...state.closedHistory].slice(0, 10),
            tabPendingClose: null,
        }));
    },

    setActiveTab: (tabId) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === tabId);

        if (tab) {
            set((state) => ({
                activeTabId: tabId,
                tabs: state.tabs.map((t) =>
                    t.id === tabId ? { ...t, lastAccessedAt: Date.now() } : t
                ),
            }));
        }
    },

    reopenLastTab: () => {
        const { closedHistory } = get();
        if (closedHistory.length === 0) return;

        const [lastClosed, ...restHistory] = closedHistory;
        const reopenedTab: Tab = {
            ...lastClosed,
            id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            lastAccessedAt: Date.now(),
        };

        set((state) => ({
            tabs: [...state.tabs, reopenedTab],
            activeTabId: reopenedTab.id,
            closedHistory: restHistory,
        }));
    },

    setTabPendingClose: (tabId) => {
        set({ tabPendingClose: tabId });
    },

    setTabDirty: (tabId, isDirty) => {
        set((state) => ({
            tabs: state.tabs.map((t) =>
                t.id === tabId ? { ...t, isDirty } : t
            ),
        }));
    },
}));