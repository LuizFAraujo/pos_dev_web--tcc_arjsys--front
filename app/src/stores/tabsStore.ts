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

    /** Abrir nova aba */
    openTab: (type: TabType, title: string, metadata?: TabMetadata) => void;

    /** Fechar aba por ID */
    closeTab: (tabId: string) => void;

    /** Ativar aba por ID */
    setActiveTab: (tabId: string) => void;

    /** Reabrir última aba fechada */
    reopenLastTab: () => void;
}

export const useTabsStore = create<TabsState>((set, get) => ({
    tabs: [],
    activeTabId: null,
    closedHistory: [],

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

    closeTab: (tabId) => {
        const { tabs, activeTabId } = get();
        const tabToClose = tabs.find((t) => t.id === tabId);

        if (!tabToClose) return;

        const newTabs = tabs.filter((t) => t.id !== tabId);
        let newActiveTabId = activeTabId;

        // Se fechou a aba ativa, ativar a próxima
        if (activeTabId === tabId) {
            const closedIndex = tabs.findIndex((t) => t.id === tabId);
            if (newTabs.length > 0) {
                // Ativar aba à direita, ou à esquerda se for a última
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
        }));
    },

    setActiveTab: (tabId) => {
        const { tabs } = get();
        const tab = tabs.find((t) => t.id === tabId);

        if (tab) {
            // Atualizar lastAccessedAt
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
}));