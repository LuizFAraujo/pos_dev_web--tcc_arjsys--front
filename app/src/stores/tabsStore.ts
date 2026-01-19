/**
 * tabsStore.ts - Store para gerenciar abas abertas no workspace
 * 
 * Gerencia múltiplas abas abertas, aba ativa, histórico de fechamento.
 * Integrado com Registry Pattern para buscar configurações.
 * Integrado com recentsStore para adicionar aos recentes automaticamente.
 */

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { getTabConfig } from '@/registries';
import { useRecentsStore } from './recentsStore';
import type { Tab, TabType } from '@/types/tab.types';

interface TabsState {
    /** Lista de abas abertas */
    tabs: Tab[];

    /** ID da aba atualmente ativa */
    activeTabId: string | null;

    /** Histórico de abas fechadas (para Ctrl+Shift+T) */
    closedHistory: Array<{ type: TabType; title: string }>;

    /** Abre uma nova aba ou foca se já existe */
    openTab: (type: TabType, customTitle?: string) => void;

    /** Fecha uma aba pelo ID */
    closeTab: (id: string, force?: boolean) => void;

    /** Define qual aba está ativa */
    setActiveTab: (id: string) => void;

    /** Reabre a última aba fechada */
    reopenLastTab: () => void;

    /** Atualiza o título de uma aba */
    updateTabTitle: (id: string, title: string) => void;

    /** Marca/desmarca aba como "dirty" (com alterações não salvas) */
    setTabDirty: (id: string, isDirty: boolean) => void;
}

export const useTabsStore = create<TabsState>((set, get) => ({
    tabs: [],
    activeTabId: null,
    closedHistory: [],

    openTab: (type: TabType, customTitle?) => {
        // Busca configuração no Registry
        const config = getTabConfig(type);
        if (!config) {
            console.error(`Tab type "${type}" not found in registry`);
            return;
        }

        // Cria nova aba
        const newTab: Tab = {
            id: nanoid(),
            type,
            title: customTitle || config.defaultTitle,
            icon: config.icon,
            isDirty: false,
            createdAt: Date.now(),
            lastAccessedAt: Date.now(),
        };

        // Adiciona aos recentes
        useRecentsStore.getState().addRecent(type);

        // Adiciona aba e torna ativa
        set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
        }));
    },

    closeTab: (id, force = false) => {
        const tab = get().tabs.find((t) => t.id === id);
        if (!tab) return;

        // Se aba tem alterações não salvas e não é force, poderia mostrar confirmação
        // (implementação de modal seria aqui, mas por enquanto fecha direto)
        if (tab.isDirty && !force) {
            // TODO: Mostrar modal de confirmação
            console.warn('Tab has unsaved changes');
        }

        // Adiciona ao histórico de fechamento
        set((state) => ({
            closedHistory: [
                ...state.closedHistory,
                { type: tab.type, title: tab.title },
            ].slice(-10), // Mantém apenas os últimos 10
        }));

        // Remove aba
        set((state) => {
            const newTabs = state.tabs.filter((t) => t.id !== id);
            let newActiveId = state.activeTabId;

            // Se fechou a aba ativa, ativa a próxima
            if (state.activeTabId === id) {
                const closedIndex = state.tabs.findIndex((t) => t.id === id);
                if (newTabs.length > 0) {
                    // Tenta ativar a aba seguinte, ou a anterior se for a última
                    const nextIndex = Math.min(closedIndex, newTabs.length - 1);
                    newActiveId = newTabs[nextIndex].id;
                } else {
                    newActiveId = null;
                }
            }

            return {
                tabs: newTabs,
                activeTabId: newActiveId,
            };
        });
    },

    setActiveTab: (id) => {
        const tab = get().tabs.find((t) => t.id === id);
        if (tab) {
            set((state) => ({
                activeTabId: id,
                tabs: state.tabs.map((t) =>
                    t.id === id
                        ? { ...t, lastAccessedAt: Date.now() }
                        : t
                ),
            }));
        }
    },

    reopenLastTab: () => {
        const lastClosed = get().closedHistory[get().closedHistory.length - 1];
        if (lastClosed) {
            get().openTab(lastClosed.type, lastClosed.title);
            // Remove do histórico
            set((state) => ({
                closedHistory: state.closedHistory.slice(0, -1),
            }));
        }
    },

    updateTabTitle: (id, title) => {
        set((state) => ({
            tabs: state.tabs.map((tab) =>
                tab.id === id ? { ...tab, title } : tab
            ),
        }));
    },

    setTabDirty: (id, isDirty) => {
        set((state) => ({
            tabs: state.tabs.map((tab) =>
                tab.id === id ? { ...tab, isDirty } : tab
            ),
        }));
    },
}));