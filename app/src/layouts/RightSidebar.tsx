/**
 * RightSidebar.tsx - Sidebar deslizante da direita
 * 
 * Container genérico que desliza da direita para exibir diferentes conteúdos.
 * Controlado pelo rightSidebarStore.
 * 
 * Tipos de conteúdo:
 * - Settings: configurações do sistema
 * - Notifications: notificações e alertas
 * - Sessions: sessões ativas
 * - Stats: estatísticas de uso
 * 
 * Funcionalidades:
 * - Backdrop com click-outside para fechar
 * - Animação slide da direita
 * - Largura responsiva
 * - Conteúdo dinâmico baseado no tipo
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@ui/sheet';
import { useRightSidebarStore } from '@stores';

interface RightSidebarProps {
    /** Tipo da sidebar sendo exibida */
    type: 'settings' | 'notifications' | 'sessions' | 'stats';

    /** Título exibido no header */
    title: string;

    /** Conteúdo da sidebar */
    children: React.ReactNode;
}

export function RightSidebar({ type, title, children }: RightSidebarProps) {
    const openSidebar = useRightSidebarStore((state) => state.openSidebar);
    const close = useRightSidebarStore((state) => state.close);

    const isOpen = openSidebar === type;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
            <SheetContent side="right" className="w-full sm:w-96 sm:max-w-96">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 px-4">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    );
}