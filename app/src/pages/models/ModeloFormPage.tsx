/**
 * ModeloFormPage.tsx - Página modelo de formulário
 */

import { Save, X, Settings } from 'lucide-react';
import { PageWrapper } from '@/components/shared/PageWrapper';
import { PageHeader } from '@/components/shared/PageHeader';
import { useRightSidebarStore } from '@stores';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { useTabForm } from '@/hooks/useTabForm';
import type { Tab } from '@/types/tab.types';

interface ModeloFormPageProps {
    tab: Tab;
}

export function ModeloFormPage({ tab }: ModeloFormPageProps) {
    const { values, setValue, resetForm } = useTabForm(tab, {
        nome: '',
        email: '',
        telefone: '',
        cpfCnpj: '',
        categoria: '',
        status: '',
        observacoes: '',
    });

    const openRightSidebar = useRightSidebarStore((state) => state.open);

    const handleSave = () => {
        console.log(`[Aba ${tab.id}] Salvando:`, values);
    };

    const handleCancel = () => {
        resetForm();
    };

    const handleOpenSettings = () => {
        openRightSidebar('settings');
    };

    return (
        <PageWrapper>
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
                        Configurações
                    </button>
                }
            />

            {/* Content - SEM overflow aqui! */}
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo *</Label>
                                <Input
                                    id="nome"
                                    type="text"
                                    placeholder="Digite o nome completo"
                                    value={values.nome}
                                    onChange={(e) => setValue('nome', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    value={values.email}
                                    onChange={(e) => setValue('email', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="telefone">Telefone</Label>
                                    <Input
                                        id="telefone"
                                        type="text"
                                        placeholder="(00) 00000-0000"
                                        value={values.telefone}
                                        onChange={(e) => setValue('telefone', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                                    <Input
                                        id="cpfCnpj"
                                        type="text"
                                        placeholder="000.000.000-00"
                                        value={values.cpfCnpj}
                                        onChange={(e) => setValue('cpfCnpj', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoria *</Label>
                                <Select 
                                    value={values.categoria} 
                                    onValueChange={(val) => setValue('categoria', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="categoria-a">Categoria A</SelectItem>
                                        <SelectItem value="categoria-b">Categoria B</SelectItem>
                                        <SelectItem value="categoria-c">Categoria C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select 
                                    value={values.status} 
                                    onValueChange={(val) => setValue('status', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Ativo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ativo">Ativo</SelectItem>
                                        <SelectItem value="inativo">Inativo</SelectItem>
                                        <SelectItem value="pendente">Pendente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <Textarea
                                    id="observacoes"
                                    placeholder="Digite observações adicionais..."
                                    className="min-h-25"
                                    value={values.observacoes}
                                    onChange={(e) => setValue('observacoes', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Save className="h-4 w-4" />
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}