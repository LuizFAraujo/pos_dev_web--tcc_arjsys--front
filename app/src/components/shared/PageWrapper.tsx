/**
 * PageWrapper.tsx - Container padrão para páginas do sistema
 * 
 * Wrapper reutilizável que fornece estrutura consistente para todas as páginas.
 * 
 * Funcionalidades:
 * - Padding consistente
 * - Scroll isolado (overflow-auto)
 * - Flex column layout
 * - Suporte dark mode
 */

import type { ReactNode } from 'react';

interface PageWrapperProps {
    /** Conteúdo da página */
    children: ReactNode;

    /** Classe CSS adicional (opcional) */
    className?: string;
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
    return (
        <div className={`flex flex-1 flex-col relative ${className}`}>
            {/* ← SEM overflow-y-auto aqui */}
            {children}
        </div>
    );
}