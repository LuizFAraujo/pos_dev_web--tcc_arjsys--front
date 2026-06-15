/**
 * docPreviewStore.ts - Preferências do modal de prévia de documento (DocPreviewDialog).
 *
 * Global por usuário, persistido no localStorage com escopo de usuário.
 * Separado do cardViewStore de propósito.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { userScopedStorage } from '@/lib/userScopedStorage';

interface DocPreviewState {
  /** Mostrar a barra de ferramentas nativa do PDF (zoom, imprimir, páginas). */
  pdfToolbar: boolean;
  setPdfToolbar: (v: boolean) => void;
  /** Tamanho do modal em px (null = usa o tamanho padrão do CSS). */
  modalWidth: number | null;
  modalHeight: number | null;
  setModalSize: (w: number, h: number) => void;
}

export const useDocPreviewStore = create<DocPreviewState>()(
  persist(
    (set) => ({
      // Padrão desligado: mais espaço pro desenho. Liga quando precisar imprimir.
      pdfToolbar: false,
      setPdfToolbar: (pdfToolbar) => set({ pdfToolbar }),
      modalWidth: null,
      modalHeight: null,
      setModalSize: (modalWidth, modalHeight) => set({ modalWidth, modalHeight }),
    }),
    {
      name: 'arjsys-doc-preview',
      storage: createJSONStorage(() => userScopedStorage),
    },
  ),
);
