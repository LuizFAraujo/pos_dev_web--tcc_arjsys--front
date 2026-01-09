/**
 * SessionsContent.tsx - Conteúdo da sidebar de sessões
 * 
 * Exibe sessões ativas do usuário (mock data).
 * Mostra dispositivo, localização e último acesso.
 */

import { Monitor, Smartphone, MapPin, Clock } from 'lucide-react';
import { Badge } from '@ui/badge';

const MOCK_SESSIONS = [
    {
        id: 1,
        device: 'Desktop - Chrome',
        icon: Monitor,
        location: 'São Paulo, BR',
        lastActive: 'Agora',
        isCurrent: true,
    },
    {
        id: 2,
        device: 'Mobile - Safari',
        icon: Smartphone,
        location: 'São Paulo, BR',
        lastActive: '2 horas atrás',
        isCurrent: false,
    },
];

export function SessionsContent() {
    /**
     * Simula logout de sessão
     */
    const handleLogoutSession = (id: number) => {
        console.log(`Logout session ${id} - Será implementado na Fase 6`);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Sessões Ativas
                </h3>
            </div>

            {/* Lista */}
            <div className="space-y-3">
                {MOCK_SESSIONS.map((session) => {
                    const Icon = session.icon;
                    return (
                        <div
                            key={session.id}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex gap-3">
                                <Icon className="h-5 w-5 shrink-0 mt-0.5 text-slate-600 dark:text-slate-400" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {session.device}
                                        </h4>
                                        {session.isCurrent && (
                                            <Badge variant="secondary" className="text-xs">
                                                Atual
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 mb-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{session.location}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
                                        Último acesso: {session.lastActive}
                                    </p>
                                    {!session.isCurrent && (
                                        <button
                                            onClick={() => handleLogoutSession(session.id)}
                                            className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                        >
                                            Encerrar sessão
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Gerenciamento completo de sessões será implementado na Fase 6.
                </p>
            </div>
        </div>
    );
}