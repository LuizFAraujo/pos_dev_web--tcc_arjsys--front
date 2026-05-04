/**
 * userScopedStorage.ts - Storage do localStorage namespeado por user.
 *
 * Cada chave fica `${baseName}-${userId}`. Quando user troca, a próxima
 * gravação/leitura usa o id novo automaticamente. Sem user logado, usa
 * o sufixo "-anon" (descartado depois).
 *
 * Uso com Zustand persist:
 *
 *   persist(...creator..., {
 *     name: 'arjsys-favorites',
 *     storage: createJSONStorage(() => userScopedStorage),
 *   })
 *
 * O `name` continua sendo o "base" - o storage adapter intercepta e
 * adiciona o sufixo do user atual.
 */

import { useAuthStore } from '@/stores/authStore';

function currentSuffix(): string {
  // Lê direto o estado atual do authStore (sem subscrever).
  const f = useAuthStore.getState().funcionario;
  return f ? String(f.funcionarioId) : 'anon';
}

function scopedKey(baseName: string): string {
  return `${baseName}-${currentSuffix()}`;
}

/**
 * Storage compatível com Zustand `createJSONStorage`. As chamadas
 * recebem o `name` que foi passado no `persist({ name })`. Aqui
 * convertemos pra `${name}-${userId}` antes de tocar o localStorage.
 */
export const userScopedStorage: Storage = {
  get length() {
    return localStorage.length;
  },
  clear: () => localStorage.clear(),
  key: (i: number) => localStorage.key(i),
  getItem: (name: string) => localStorage.getItem(scopedKey(name)),
  setItem: (name: string, value: string) =>
    localStorage.setItem(scopedKey(name), value),
  removeItem: (name: string) => localStorage.removeItem(scopedKey(name)),
};

/**
 * Versão funcional pra uso direto sem persist do Zustand
 * (ex: DataGrid column widths). Lê/grava com prefixo do user atual.
 */
export const userScopedLocalStorage = {
  get(baseName: string): string | null {
    return localStorage.getItem(scopedKey(baseName));
  },
  set(baseName: string, value: string) {
    localStorage.setItem(scopedKey(baseName), value);
  },
  remove(baseName: string) {
    localStorage.removeItem(scopedKey(baseName));
  },
};
