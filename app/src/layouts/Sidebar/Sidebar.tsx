/**
 * Sidebar.tsx — Componente principal do menu lateral
 *
 * Delega renderização para SidebarCompact ou SidebarNormal conforme o modo.
 * 3 modos: closed (0px), compact (64px, ícones), normal (240px, lista).
 */

import { useSidebarStore } from '@stores';
import { SidebarCompact } from './SidebarCompact';
import { SidebarNormal } from './SidebarNormal';

export function Sidebar() {
  const mode = useSidebarStore((state) => state.mode);

  if (mode === 'closed') {
    return <aside className="w-0 overflow-hidden transition-all duration-300 ease-in-out" />;
  }

  if (mode === 'compact') {
    return <SidebarCompact />;
  }

  return <SidebarNormal />;
}
