/**
 * FuncionarioForm.tsx — Form inline de cadastro/edição/visualização de funcionário
 *
 * Modos:
 *   view — inputs readOnly
 *   edit — inputs editáveis (usuario não editável, senha opcional)
 *   new  — inputs editáveis, campos vazios (usuario e senha obrigatórios)
 *
 * Abas: Identificação | Contato | Endereço
 * Usa useFormTabNavigation para foco e navegação entre abas.
 */

import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import type { Funcionario, FuncionarioFormData } from '@/types/admin/funcionario.types';
import type { PageMode } from '@/components/shared/PageShell';

export interface FuncionarioFormHandle {
  submit: () => Promise<boolean>;
}

interface FuncionarioFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  funcionario: Funcionario | null;
  onDirty: () => void;
  onSave: (data: FuncionarioFormData) => Promise<void>;
}

const EMPTY: FuncionarioFormData = {
  nome: '', cpfCnpj: '', cargo: '', setor: '',
  usuario: '', senha: '',
  telefone: '', email: '', endereco: '',
  cidade: '', estado: '', cep: '',
};

const TABS = ['identificacao', 'contato', 'endereco'];

/** Mapa campo → aba (para navegar até o erro) */
const FIELD_TAB: Record<string, string> = {
  nome: 'identificacao', cpfCnpj: 'identificacao',
  cargo: 'identificacao', setor: 'identificacao',
  usuario: 'identificacao', senha: 'identificacao',
  telefone: 'contato', email: 'contato',
  endereco: 'endereco', cidade: 'endereco', estado: 'endereco', cep: 'endereco',
};

// ─── Campo ────────────────────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, readOnly, disabled, maxLength, error, type = 'text', span, placeholder,
}: {
  id: string; label: string; value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean; disabled?: boolean; maxLength?: number; error?: string;
  type?: string; placeholder?: string;
  span?: 'col-span-1' | 'col-span-2' | 'col-span-3';
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${span ?? 'col-span-1'}`}>
      <Label htmlFor={id} className={`text-xs font-medium ${error ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </Label>
      <Input
        id={id} type={type} value={value} maxLength={maxLength} placeholder={placeholder}
        readOnly={readOnly} disabled={disabled}
        onChange={(e) => !readOnly && !disabled && onChange?.(e.target.value)}
        className={`h-9 text-sm bg-white dark:bg-slate-950 ${
          readOnly ? 'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0' : ''
        } ${disabled ? 'opacity-60' : ''
        } ${error ? 'border-red-400 dark:border-red-500 focus-visible:ring-red-400/30' : ''}`}
      />
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <span className="inline-block h-1 w-1 rounded-full bg-red-400 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const FuncionarioForm = forwardRef<FuncionarioFormHandle, FuncionarioFormProps>(
  function FuncionarioForm({ mode, funcionario, onDirty, onSave }, ref) {
    const readOnly = mode === 'view';
    const isEditing = mode === 'edit';
    const [data, setData] = useState<FuncionarioFormData>({ ...EMPTY });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } = useFormTabNavigation({
      tabs: TABS,
      defaultTab: 'identificacao',
    });

    // Reseta form ao trocar de item ou modo
    useEffect(() => {
      setErrors({});
      setData(funcionario ? {
        nome:     funcionario.nome     ?? '',
        cpfCnpj:  funcionario.cpfCnpj  ?? '',
        cargo:    funcionario.cargo    ?? '',
        setor:    funcionario.setor    ?? '',
        usuario:  funcionario.usuario  ?? '',
        senha:    '',
        telefone: funcionario.telefone ?? '',
        email:    funcionario.email    ?? '',
        endereco: funcionario.endereco ?? '',
        cidade:   funcionario.cidade   ?? '',
        estado:   funcionario.estado   ?? '',
        cep:      funcionario.cep      ?? '',
      } : { ...EMPTY });
    }, [funcionario, mode]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const e: Record<string, string> = {};
        if (!data.nome.trim()) e.nome = 'Nome é obrigatório';
        if (!data.usuario.trim()) e.usuario = 'Usuário é obrigatório';
        if (!isEditing && !data.senha?.trim()) e.senha = 'Senha é obrigatória para novo funcionário';
        if (data.email && !data.email.includes('@')) e.email = 'E-mail inválido';
        if (data.estado && data.estado.length !== 2) e.estado = 'UF deve ter 2 letras';
        setErrors(e);
        if (Object.keys(e).length > 0) {
          const firstErrorField = Object.keys(e)[0];
          const targetTab = FIELD_TAB[firstErrorField];
          if (targetTab) {
            setActiveTab(targetTab);
            requestAnimationFrame(() => {
              setTimeout(() => {
                document.getElementById(firstErrorField)?.focus();
              }, 50);
            });
          }
          toast.error('Corrija os campos destacados.');
          return false;
        }
        const payload: FuncionarioFormData = {
          nome:     data.nome.trim(),
          usuario:  data.usuario.trim(),
          cpfCnpj:  data.cpfCnpj?.trim()  || undefined,
          cargo:    data.cargo?.trim()     || undefined,
          setor:    data.setor?.trim()     || undefined,
          telefone: data.telefone?.trim()  || undefined,
          email:    data.email?.trim()     || undefined,
          endereco: data.endereco?.trim()  || undefined,
          cidade:   data.cidade?.trim()    || undefined,
          estado:   data.estado?.trim().toUpperCase() || undefined,
          cep:      data.cep?.trim()       || undefined,
        };
        if (data.senha?.trim()) payload.senha = data.senha.trim();
        await onSave(payload);
        return true;
      },
    }));

    const set = (field: keyof FuncionarioFormData, value: string) => {
      setData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
      onDirty();
    };

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full gap-0">

          <div className="shrink-0 px-6 pt-4 pb-0">
            <TabsList>
              <TabsTrigger value="identificacao">Identificação</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
            </TabsList>
          </div>

          {/* Identificação */}
          <TabsContent value="identificacao" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-3 gap-x-6 gap-y-5">
              <Field id="nome" label="Nome *" value={data.nome}
                onChange={(v) => set('nome', v)} readOnly={readOnly}
                error={errors.nome} span="col-span-3" />
              <Field id="cpfCnpj" label="CPF/CNPJ" value={data.cpfCnpj ?? ''}
                onChange={(v) => set('cpfCnpj', v)} readOnly={readOnly} />
              <Field id="cargo" label="Cargo" value={data.cargo ?? ''}
                onChange={(v) => set('cargo', v)} readOnly={readOnly} />
              <Field id="setor" label="Setor" value={data.setor ?? ''}
                onChange={(v) => set('setor', v)} readOnly={readOnly} />
              <Field id="usuario" label={isEditing ? 'Usuário * (não editável)' : 'Usuário *'}
                value={data.usuario}
                onChange={(v) => set('usuario', v)}
                readOnly={readOnly} disabled={isEditing}
                error={errors.usuario} />
              <Field id="senha" label={isEditing ? 'Nova Senha' : 'Senha *'}
                value={data.senha ?? ''} type="password"
                onChange={(v) => set('senha', v)} readOnly={readOnly}
                placeholder={isEditing ? 'Deixe vazio para manter' : ''}
                error={errors.senha} />
            </div>
          </TabsContent>

          {/* Contato */}
          <TabsContent value="contato" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-3 gap-x-6 gap-y-5">
              <Field id="telefone" label="Telefone" value={data.telefone ?? ''}
                onChange={(v) => set('telefone', v)} readOnly={readOnly} />
              <Field id="email" label="E-mail" type="email" value={data.email ?? ''}
                onChange={(v) => set('email', v)} readOnly={readOnly}
                error={errors.email} span="col-span-2" />
            </div>
          </TabsContent>

          {/* Endereço */}
          <TabsContent value="endereco" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-3 gap-x-6 gap-y-5">
              <Field id="endereco" label="Endereço" value={data.endereco ?? ''}
                onChange={(v) => set('endereco', v)} readOnly={readOnly} span="col-span-3" />
              <Field id="cidade" label="Cidade" value={data.cidade ?? ''}
                onChange={(v) => set('cidade', v)} readOnly={readOnly} />
              <Field id="estado" label="UF" value={data.estado ?? ''} maxLength={2}
                onChange={(v) => set('estado', v.toUpperCase())} readOnly={readOnly}
                error={errors.estado} />
              <Field id="cep" label="CEP" value={data.cep ?? ''}
                onChange={(v) => set('cep', v)} readOnly={readOnly} />
            </div>
          </TabsContent>

        </Tabs>
      </div>
    );
  }
);
