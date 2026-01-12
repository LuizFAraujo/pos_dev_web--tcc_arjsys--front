/**
 * sidebarStore.ts - Store para gerenciar estado da sidebar esquerda
 * 
 * Controla visibilidade e comportamento da sidebar principal.
 * Estado persistido no localStorage.
 * 
 * Modos:
 * - normal: sidebar visível completa (240px)
 * - compact: sidebar compacta com ícones (64px) - só quando pinado
 * - closed: sidebar oculta (0px) - só quando não pinado
 * 
 * Pin (fixar):
 * - isPinned true: sidebar sempre visível (normal/compact)
 * - isPinned false: sidebar pode ser fechada (normal/closed)
 * 
 * Toggle (hambúrguer no Header):
 * - Pinado: normal ↔ compact
 * - Não pinado: normal ↔ closed
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarMode = 'normal' | 'compact' | 'closed';

interface SidebarState {
    /** Modo atual da sidebar */
    mode: SidebarMode;

    /** Se sidebar está fixada */
    isPinned: boolean;

    /** Define modo específico */
    setMode: (mode: SidebarMode) => void;

    /** Alterna pin */
    togglePin: () => void;

    /** Toggle principal (abre/fecha sidebar) - controlado pelo hambúrguer no Header */
    toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set, get) => ({
            mode: 'normal',
            isPinned: false,  // ← Padrão: não pinado

            setMode: (mode) => set({ mode }),

            togglePin: () => set((state) => ({ isPinned: !state.isPinned })),

            toggle: () => {
                const { mode, isPinned } = get();

                if (mode === 'closed' || mode === 'compact') {
                    // Abre sidebar para modo normal
                    set({ mode: 'normal' });
                } else {
                    // Fecha sidebar (compact se pinado, closed se não pinado)
                    set({ mode: isPinned ? 'compact' : 'closed' });
                }
            },
        }),
        {
            name: 'sidebar-storage',  // ← Nome no localStorage
        }
    )
);