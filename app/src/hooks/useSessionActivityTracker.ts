/**
 * useSessionActivityTracker.ts - Renova a sessão por atividade do user.
 *
 * Listeners no window pra mousemove/keydown/click/scroll. Eventos só
 * disparam quando a aba está focada e o user está interagindo com ela
 * (não dispara se outro app/aba estiver ativo). Cada atividade renova
 * o timestamp da sessão, com throttle pra não martelar o store.
 */

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { SESSION_ACTIVITY_THROTTLE_MS } from '@/lib/authConfig';

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'keydown',
  'click',
  'scroll',
  'touchstart',
];

export function useSessionActivityTracker() {
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < SESSION_ACTIVITY_THROTTLE_MS) return;
      lastRefreshRef.current = now;
      useAuthStore.getState().refreshSession();
    };

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, handleActivity, { passive: true });
    }

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, handleActivity);
      }
    };
  }, []);
}
