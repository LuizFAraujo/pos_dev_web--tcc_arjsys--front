/**
 * useRestoreFocus.ts — Devolve o foco para um elemento após fechar um modal/dialog
 *
 * Uso:
 *   useRestoreFocus(gridRef, modalOpen)
 *   useRestoreFocus(gridRef, deleteDialogOpen)
 *
 * Funciona com qualquer ref que tenha focus() — DataGridHandle, CardGridHandle, etc.
 * Chame uma vez por modal na página. O foco é restaurado com um pequeno delay
 * para garantir que o Radix Dialog terminou de processar o fechamento.
 */

import { useEffect, useRef } from 'react';

interface Focusable {
  focus: () => void;
}

/**
 * @param targetRef  Ref do elemento que deve receber o foco (ex: gridRef)
 * @param isOpen     Estado do modal — quando muda de true → false, restaura o foco
 */
export function useRestoreFocus(
  targetRef: React.RefObject<Focusable | null>,
  isOpen: boolean,
) {
  const wasOpen = useRef(false);

  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      // Modal acabou de fechar — restaura foco após o Radix terminar
      setTimeout(() => targetRef.current?.focus(), 0);
    }
    wasOpen.current = isOpen;
  }, [isOpen, targetRef]);
}
