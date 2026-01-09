/**
 * NotificationsContent.tsx - Conteúdo da sidebar de notificações
 * 
 * Exibe lista de notificações do sistema (mock data).
 * Mostra ícones, badges e timestamps.
 */

import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@ui/badge';

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        type: 'success',
        icon: CheckCircle,
        title: 'Pedido finalizado',
        message: 'Pedido #1234 foi finalizado com sucesso.',
        time: '5 min atrás',
        unread: true,
    },
    {
        id: 2,
        type: 'warning',
        icon: AlertCircle,
        title: 'Estoque baixo',
        message: 'Produto XYZ está com estoque baixo.',
        time: '1 hora atrás',
        unread: true,
    },
    {
        id: 3,
        type: 'info',
        icon: Info,
        title: 'Atualização disponível',
        message: 'Nova versão do sistema disponível.',
        time: '2 horas atrás',
        unread: false,
    },
];

export function NotificationsContent() {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Notificações
                    </h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                    3 novas
                </Badge>
            </div>

            {/* Lista */}
            <div className="space-y-3">
                {MOCK_NOTIFICATIONS.map((notif) => {
                    const Icon = notif.icon;
                    return (
                        <div
                            key={notif.id}
                            className={`p-3 rounded-lg border transition-colors cursor-pointer ${notif.unread
                                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="flex gap-3">
                                <Icon
                                    className={`h-5 w-5 shrink-0 mt-0.5 ${notif.type === 'success'
                                            ? 'text-green-600'
                                            : notif.type === 'warning'
                                                ? 'text-amber-600'
                                                : 'text-blue-600'
                                        }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {notif.title}
                                        </h4>
                                        {notif.unread && (
                                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                        {notif.message}
                                    </p>
                                    <span className="text-xs text-slate-500 dark:text-slate-500">
                                        {notif.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline bg-transparent">
                    Ver todas as notificações
                </button>
            </div>
        </div>
    );
}