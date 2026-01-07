/**
 * sidebarStore.ts - Store de estado da sidebar
 * 
 * Gerencia o estado da sidebar esquerda:
 * - Modo de exibição (normal, compact, closed)
 * - Estado de fixação (pinned)
 */

import { create } from 'zustand';

type SidebarMode = 'normal' | 'compact' | 'closed';

interface SidebarState {
    /** Modo atual da sidebar */
    mode: SidebarMode;

    /** Se a sidebar está fixada (não fecha ao perder foco) */
    isPinned: boolean;

    /** Alternar modo da sidebar */
    toggleMode: () => void;

    /** Definir modo específico */
    setMode: (mode: SidebarMode) => void;

    /** Alternar fixação */
    togglePin: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    mode: 'normal',
    isPinned: true,

    toggleMode: () => {
        set((state) => {
            const modes: SidebarMode[] = ['normal', 'compact', 'closed'];
            const currentIndex = modes.indexOf(state.mode);
            const nextIndex = (currentIndex + 1) % modes.length;
            return { mode: modes[nextIndex] };
        });
    },

    setMode: (mode) => {
        set({ mode });
    },

    togglePin: () => {
        set((state) => ({ isPinned: !state.isPinned }));
    },
}));