/**
 * pageRightSidebarStore.ts - Store para RightSidebar de página
 * 
 * Gerencia estado do sidebar lateral direito específico de cada página/aba.
 * Diferente do rightSidebarStore global, este é limitado à área da página.
 */

import { create } from 'zustand';

type PageSidebarType = 'settings' | 'info' | 'history' | 'help' | null;

interface PageRightSidebarState {
    /** Tipo do sidebar aberto (null = fechado) */
    openSidebar: PageSidebarType;

    /** Abre sidebar com tipo específico */
    open: (type: Exclude<PageSidebarType, null>) => void;

    /** Fecha sidebar */
    close: () => void;

    /** Toggle sidebar (abre se fechado, fecha se aberto) */
    toggle: (type: Exclude<PageSidebarType, null>) => void;
}

export const usePageRightSidebarStore = create<PageRightSidebarState>((set, get) => ({
    openSidebar: null,

    open: (type) => set({ openSidebar: type }),

    close: () => set({ openSidebar: null }),

    toggle: (type) => {
        const current = get().openSidebar;
        set({ openSidebar: current === type ? null : type });
    },
}));