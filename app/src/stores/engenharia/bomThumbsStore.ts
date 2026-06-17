/**
 * bomThumbsStore.ts - Preferências das miniaturas na BOM (flat e tree).
 *
 * Global por usuário, persistido. Compartilhado entre a visão flat (BOMPage) e a
 * tree (BOMForm): ligar/ajustar numa reflete na outra.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userScopedStorage } from '@/lib/userScopedStorage';

interface BomThumbsState {
  /** Modo miniaturas ligado. */
  enabled: boolean;
  /** Altura da miniatura na coluna DOC, em px. */
  thumbHeight: number;
  setEnabled: (v: boolean) => void;
  setThumbHeight: (v: number) => void;
}

export const useBomThumbsStore = create<BomThumbsState>()(
  persist(
    (set) => ({
      enabled: false,
      thumbHeight: 80,
      setEnabled: (enabled) => set({ enabled }),
      setThumbHeight: (thumbHeight) => set({ thumbHeight }),
    }),
    {
      name: 'arjsys-bom-thumbs',
      storage: createJSONStorage(() => userScopedStorage),
    },
  ),
);
