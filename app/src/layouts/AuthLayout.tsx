/**
 * AuthLayout.tsx - Layout para páginas de autenticação
 * 
 * Layout simples e centralizado para login/registro.
 * Background com gradiente e card central.
 */

import type { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Background Pattern */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md px-4">
                {children}
            </div>
        </div>
    );
}