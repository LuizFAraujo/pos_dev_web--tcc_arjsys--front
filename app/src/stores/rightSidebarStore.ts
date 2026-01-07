/**
 * rightSidebarStore.ts - Store da sidebar direita
 * 
 * Gerencia qual sidebar direita está aberta:
 * - Settings
 * - Notifications
 * - Sessions
 * - Stats
 */

import { create } from 'zustand';

type RightSidebarType = 'settings' | 'notifications' | 'sessions' | 'stats' | null;

interface RightSidebarState {
    /** Sidebar direita atualmente aberta */
    openSidebar: RightSidebarType;

    /** Abrir sidebar específica */
    open: (type: Exclude<RightSidebarType, null>) => void;

    /** Fechar sidebar */
    close: () => void;

    /** Toggle sidebar (abre se fechada, fecha se aberta) */
    toggle: (type: Exclude<RightSidebarType, null>) => void;
}

export const useRightSidebarStore = create<RightSidebarState>((set, get) => ({
    openSidebar: null,

    open: (type) => {
        set({ openSidebar: type });
    },

    close: () => {
        set({ openSidebar: null });
    },

    toggle: (type) => {
        const { openSidebar } = get();
        set({ openSidebar: openSidebar === type ? null : type });
    },
}));