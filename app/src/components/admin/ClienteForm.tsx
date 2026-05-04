/**
 * ClienteForm.tsx - Form inline de cadastro/edição/visualização de cliente
 *
 * Modos:
 *   view - inputs readOnly
 *   edit - inputs editáveis
 *   new  - inputs editáveis, campos vazios
 *
 * Usa useFormTabNavigation para:
 *   - Foco automático no primeiro campo ao montar
 *   - Foco no primeiro campo ao trocar de aba
 *   - Tab no último campo → próxima aba
 *   - Shift+Tab no primeiro campo → aba anterior
 *
 * Bug fix: onDirty é chamado a cada alteração sem guard interno.
 * O controle de isDirty fica exclusivamente no usePageMode.
 * Setar true múltiplas vezes em useState é inofensivo.
 */

import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import type { Cliente, ClienteFormData } from '@/types/admin/cliente.types';
import type { PageMode } from '@/components/shared/PageShell';

export interface ClienteFormHandle {
  submit: () => Promise<boolean>;
}

interface ClienteFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  cliente: Cliente | null;
  onDirty: () => void;
  onSave: (data: ClienteFormData) => Promise<void>;
}

const EMPTY: ClienteFormData = {
  nome: '', cpfCnpj: '', razaoSocial: '', inscricaoEstadual: '',
  contatoComercial: '', telefone: '', email: '', endereco: '',
  cidade: '', estado: '', cep: '',
};

const TABS = ['identificacao', 'contato', 'endereco'];

/** Mapa campo → aba (para navegar até o erro) */
const FIELD_TAB: Record<string, string> = {
  nome: 'identificacao', cpfCnpj: 'identificacao',
  razaoSocial: 'identificacao', inscricaoEstadual: 'identificacao',
  contatoComercial: 'contato', telefone: 'contato', email: 'contato',
  endereco: 'endereco', cidade: 'endereco', estado: 'endereco', cep: 'endereco',
};

// ─── Campo ────────────────────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, readOnly, maxLength, error, type = 'text', span,
}: {
  id: string; label: string; value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean; maxLength?: number; error?: string;
  type?: string;
  span?: 'col-span-1' | 'col-span-2' | 'col-span-3';
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${span ?? 'col-span-1'}`}>
      <Label htmlFor={id} className={`text-xs font-medium ${error ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </Label>
      <Input
        id={id} type={type} value={value} maxLength={maxLength}
        readOnly={readOnly}
        onChange={(e) => !readOnly && onChange?.(e.target.value)}
        className={`h-9 text-sm bg-white dark:bg-slate-950 ${
          readOnly ? 'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0' : ''
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

export const ClienteForm = forwardRef<ClienteFormHandle, ClienteFormProps>(
  function ClienteForm({ mode, cliente, onDirty, onSave }, ref) {
    const readOnly = mode === 'view';
    const [data, setData] = useState<ClienteFormData>({ ...EMPTY });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } = useFormTabNavigation({
      tabs: TABS,
      defaultTab: 'identificacao',
    });

    // Reseta form ao trocar de item ou modo
    useEffect(() => {
      setErrors({});
      setData(cliente ? {
        nome:              cliente.nome              ?? '',
        cpfCnpj:          cliente.cpfCnpj           ?? '',
        razaoSocial:      cliente.razaoSocial        ?? '',
        inscricaoEstadual: cliente.inscricaoEstadual ?? '',
        contatoComercial: cliente.contatoComercial   ?? '',
        telefone:         cliente.telefone           ?? '',
        email:            cliente.email              ?? '',
        endereco:         cliente.endereco           ?? '',
        cidade:           cliente.cidade             ?? '',
        estado:           cliente.estado             ?? '',
        cep:              cliente.cep                ?? '',
      } : { ...EMPTY });
    }, [cliente, mode]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const e: Record<string, string> = {};
        if (!data.nome.trim()) e.nome = 'Nome é obrigatório';
        if (data.email && !data.email.includes('@')) e.email = 'E-mail inválido';
        if (data.estado && data.estado.length !== 2) e.estado = 'UF deve ter 2 letras';
        setErrors(e);
        if (Object.keys(e).length > 0) {
          // Navega pra aba do primeiro erro e foca no campo
          const firstErrorField = Object.keys(e)[0];
          const targetTab = FIELD_TAB[firstErrorField];
          if (targetTab) {
            setActiveTab(targetTab);
            // Delay duplo: requestAnimationFrame pro React + setTimeout pro Radix montar a aba
            requestAnimationFrame(() => {
              setTimeout(() => {
                document.getElementById(firstErrorField)?.focus();
              }, 50);
            });
          }
          toast.error('Corrija os campos destacados.');
          return false;
        }
        await onSave({
          nome:              data.nome.trim(),
          cpfCnpj:          data.cpfCnpj?.trim()           || undefined,
          razaoSocial:      data.razaoSocial?.trim()        || undefined,
          inscricaoEstadual: data.inscricaoEstadual?.trim() || undefined,
          contatoComercial: data.contatoComercial?.trim()   || undefined,
          telefone:         data.telefone?.trim()           || undefined,
          email:            data.email?.trim()              || undefined,
          endereco:         data.endereco?.trim()           || undefined,
          cidade:           data.cidade?.trim()             || undefined,
          estado:           data.estado?.trim().toUpperCase() || undefined,
          cep:              data.cep?.trim()                || undefined,
        });
        return true;
      },
    }));

    // Sem isDirtyRef - onDirty chamado a cada keystroke
    // useState no usePageMode aguenta múltiplos setDirty(true) sem problema
    const set = (field: keyof ClienteFormData, value: string) => {
      setData((prev) => ({ ...prev, [field]: value }));
      // Limpa erro do campo ao editar - próximo Salvar revalida tudo
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
              <Field id="razaoSocial" label="Razão Social" value={data.razaoSocial ?? ''}
                onChange={(v) => set('razaoSocial', v)} readOnly={readOnly} span="col-span-2" />
              <Field id="inscricaoEstadual" label="Inscrição Estadual" value={data.inscricaoEstadual ?? ''}
                onChange={(v) => set('inscricaoEstadual', v)} readOnly={readOnly} />
            </div>
          </TabsContent>

          {/* Contato */}
          <TabsContent value="contato" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-3 gap-x-6 gap-y-5">
              <Field id="contatoComercial" label="Contato Comercial" value={data.contatoComercial ?? ''}
                onChange={(v) => set('contatoComercial', v)} readOnly={readOnly} span="col-span-2" />
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
