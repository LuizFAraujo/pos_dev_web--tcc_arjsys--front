/**
 * ConfirmCloseDialog.tsx - Modal de confirmação ao fechar aba com alterações
 * 
 * Exibe diálogo perguntando se deseja descartar alterações.
 */

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@ui/alert-dialog';

import { useTabsStore } from '@stores';

export function ConfirmCloseDialog() {
    const tabPendingClose = useTabsStore((state) => state.tabPendingClose);
    const setTabPendingClose = useTabsStore((state) => state.setTabPendingClose);
    const closeTab = useTabsStore((state) => state.closeTab);
    const tabs = useTabsStore((state) => state.tabs);

    const tab = tabs.find((t) => t.id === tabPendingClose);

    const handleConfirm = () => {
        if (tabPendingClose) {
            closeTab(tabPendingClose, true); // force = true
        }
    };

    const handleCancel = () => {
        setTabPendingClose(null);
    };

    return (
        <AlertDialog open={!!tabPendingClose} onOpenChange={(open) => !open && handleCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                    <AlertDialogDescription>
                        A aba <strong>{tab?.title}</strong> possui alterações não salvas.
                        Deseja realmente fechar e descartar as alterações?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
                        Descartar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}