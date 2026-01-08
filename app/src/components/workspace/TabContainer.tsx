/**
 * TabContainer.tsx - Container wrapper para conteúdo das abas
 * 
 * Envolve o conteúdo de cada aba fornecendo contexto e isolamento.
 */

import type { ReactNode } from 'react';

interface TabContainerProps {
    /** ID único da aba */
    tabId: string;

    /** Conteúdo da aba */
    children: ReactNode;
}

export function TabContainer({ tabId, children }: TabContainerProps) {
    return (
        <div
            key={tabId}
            className="flex flex-1 flex-col overflow-hidden"
        >
            {children}
        </div>
    );
}