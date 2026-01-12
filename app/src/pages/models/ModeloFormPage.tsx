/**
 * ModeloFormPage.tsx - Página modelo de formulário
 * 
 * Template de página com formulário completo.
 * Serve como exemplo de implementação para outras páginas do sistema.
 * 
 * Funcionalidades:
 * - PageHeader com título e ações
 * - Formulário completo com validação
 * - Vários tipos de campos
 * - Botões salvar/cancelar
 * - Integração com RightSidebar
 * - Dark mode
 */

import { Save, X, Settings } from 'lucide-react';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { useRightSidebarStore } from '@stores';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';

export function ModeloFormPage() {
    const openRightSidebar = useRightSidebarStore((state) => state.open);

    const handleSave = () => {
        console.log('Salvar formulário');
    };

    const handleCancel = () => {
        console.log('Cancelar formulário');
    };

    const handleOpenSettings = () => {
        openRightSidebar('settings');
    };

    return (
        <PageWrapper>
            {/* Header */}
            <PageHeader
                title="Modelo: Formulário"
                description="Template de página com formulário completo e validação"
                breadcrumbs={[
                    { label: 'Modelos', href: '/app' },
                    { label: 'Formulário' },
                ]}
                actions={
                    <button
                        onClick={handleOpenSettings}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors"
                    >
                        <Settings className="h-4 w-4" />
                        <span>Configurações</span>
                    </button>
                }
            />

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                        <form className="space-y-6">
                            {/* Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo *</Label>
                                <Input
                                    id="nome"
                                    type="text"
                                    placeholder="Digite o nome completo"
                                    className="w-full"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    className="w-full"
                                />
                            </div>

                            {/* Telefone e Documento */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input
                                        id="telefone"
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="documento">CPF/CNPJ</Label>
                                    <Input
                                        id="documento"
                                        type="text"
                                        placeholder="000.000.000-00"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Categoria */}
                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoria *</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cliente">Cliente</SelectItem>
                                        <SelectItem value="fornecedor">Fornecedor</SelectItem>
                                        <SelectItem value="parceiro">Parceiro</SelectItem>
                                        <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select defaultValue="ativo">
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ativo">Ativo</SelectItem>
                                        <SelectItem value="inativo">Inativo</SelectItem>
                                        <SelectItem value="pendente">Pendente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Observações */}
                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Textarea
                                    id="observacoes"
                                    placeholder="Digite observações adicionais..."
                                    rows={4}
                                    className="w-full resize-none"
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancelar</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>Salvar</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}