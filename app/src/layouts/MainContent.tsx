/**
 * MainContent.tsx - Área de conteúdo principal do sistema
 * 
 * Container principal que exibirá o conteúdo das abas.
 * Por enquanto apenas estrutura visual com placeholders.
 * 
 * Estrutura futura:
 * - TabsBar: barra horizontal de abas (topo)
 * - WorkspaceContent: conteúdo da aba ativa (centro)
 */

export function MainContent() {
    return (
        <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Área para TabsBar (futuro) */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    TabsBar Placeholder
                </span>
            </div>

            {/* Área para WorkspaceContent (futuro) */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Bem-vindo ao ArjSys
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Sistema ERP para gestão industrial
                    </p>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Este é o conteúdo principal. Em breve aqui será renderizado o conteúdo das abas abertas.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}