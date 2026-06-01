/**
 * useDebouncedValue.ts - Hook que aplica atraso na propagação de um valor
 *
 * Útil pra inputs de filtro/busca onde se quer evitar disparar fetch a cada
 * tecla. O hook retorna o último valor "estabilizado" depois de `delayMs` sem
 * mudanças. Default usado nos grids: 200ms.
 *
 * Uso:
 *   const filtrosDebounced = useDebouncedValue(filtros, 200);
 */

import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
