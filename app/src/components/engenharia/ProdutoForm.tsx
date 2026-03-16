/**
 * ProdutoForm.tsx — Form inline de cadastro/edição/visualização de produto
 *
 * Modos: view (readOnly), edit, new
 * Abas: Identificação | Detalhes
 * temDocumento é somente leitura (atualizado por varredura, não editável)
 */

import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import type { Produto, ProdutoFormData, TipoProduto, UnidadeMedida } from '@/types/engenharia/produto.types';
import { TIPO_PRODUTO_LABELS, UNIDADE_LABELS } from '@/types/engenharia/produto.types';
import type { PageMode } from '@/components/shared/PageShell';

export interface ProdutoFormHandle {
  submit: () => Promise<boolean>;
}

interface ProdutoFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  produto: Produto | null;
  onDirty: () => void;
  onSave: (data: ProdutoFormData) => Promise<void>;
}

const EMPTY: ProdutoFormData = {
  codigo: '', descricao: '', descricaoCompleta: '',
  unidade: 'UN', tipo: 'Fabricado', peso: undefined, ativo: true,
};

const TABS = ['identificacao', 'detalhes'];

const FIELD_TAB: Record<string, string> = {
  codigo: 'identificacao', descricao: 'identificacao', descricaoCompleta: 'identificacao',
  tipo: 'identificacao', unidade: 'identificacao',
  peso: 'detalhes', ativo: 'detalhes',
};

const TIPO_OPTIONS: TipoProduto[] = ['Fabricado', 'Comprado', 'MateriaPrima', 'Revenda', 'Servico'];
const UNIDADE_OPTIONS: UnidadeMedida[] = ['UN', 'PC', 'CJ', 'KG', 'KT', 'MT', 'M2', 'M3', 'LT'];

// ─── Campo texto ──────────────────────────────────────────────────────────────

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

// ─── Campo select ─────────────────────────────────────────────────────────────

function SelectField<T extends string>({
  id, label, value, options, labels, onChange, readOnly, error, span,
}: {
  id: string; label: string; value: T;
  options: T[]; labels: Record<T, string>;
  onChange?: (v: T) => void;
  readOnly?: boolean; error?: string;
  span?: 'col-span-1' | 'col-span-2' | 'col-span-3';
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${span ?? 'col-span-1'}`}>
      <Label htmlFor={id} className={`text-xs font-medium ${error ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </Label>
      {readOnly ? (
        <Input id={id} value={labels[value] || value} readOnly
          className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0" />
      ) : (
        <select id={id} value={value}
          onChange={(e) => onChange?.(e.target.value as T)}
          className="h-9 text-sm rounded-md border border-input bg-white dark:bg-slate-950 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {options.map((opt) => (
            <option key={opt} value={opt}>{labels[opt]}</option>
          ))}
        </select>
      )}
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

export const ProdutoForm = forwardRef<ProdutoFormHandle, ProdutoFormProps>(
  function ProdutoForm({ mode, produto, onDirty, onSave }, ref) {
    const readOnly = mode === 'view';
    const [data, setData] = useState<ProdutoFormData>({ ...EMPTY });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } = useFormTabNavigation({
      tabs: TABS,
      defaultTab: 'identificacao',
    });

    useEffect(() => {
      setErrors({});
      setData(produto ? {
        codigo:            produto.codigo            ?? '',
        descricao:         produto.descricao         ?? '',
        descricaoCompleta: produto.descricaoCompleta ?? '',
        unidade:           produto.unidade           ?? 'UN',
        tipo:              produto.tipo              ?? 'Fabricado',
        peso:              produto.peso              ?? undefined,
        ativo:             produto.ativo             ?? true,
      } : { ...EMPTY });
    }, [produto, mode]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const e: Record<string, string> = {};
        if (!data.codigo.trim()) e.codigo = 'Código é obrigatório';
        if (!data.descricao.trim()) e.descricao = 'Descrição é obrigatória';
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
        await onSave({
          codigo:            data.codigo.trim(),
          descricao:         data.descricao.trim(),
          descricaoCompleta: data.descricaoCompleta?.trim() || undefined,
          unidade:           data.unidade,
          tipo:              data.tipo,
          peso:              data.peso ?? undefined,
          ativo:             data.ativo,
        });
        return true;
      },
    }));

    const set = (field: keyof ProdutoFormData, value: any) => {
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
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>
          </div>

          {/* Identificação */}
          <TabsContent value="identificacao" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-3 gap-x-6 gap-y-5">
              <Field id="codigo" label="Código *" value={data.codigo}
                onChange={(v) => set('codigo', v)} readOnly={readOnly}
                error={errors.codigo} />
              <Field id="descricao" label="Descrição *" value={data.descricao}
                onChange={(v) => set('descricao', v)} readOnly={readOnly}
                error={errors.descricao} span="col-span-2" />
              <Field id="descricaoCompleta" label="Descrição Completa" value={data.descricaoCompleta ?? ''}
                onChange={(v) => set('descricaoCompleta', v)} readOnly={readOnly}
                span="col-span-3" />
              <SelectField id="tipo" label="Tipo" value={data.tipo}
                options={TIPO_OPTIONS} labels={TIPO_PRODUTO_LABELS}
                onChange={(v) => set('tipo', v)} readOnly={readOnly} />
              <SelectField id="unidade" label="Unidade" value={data.unidade}
                options={UNIDADE_OPTIONS} labels={UNIDADE_LABELS}
                onChange={(v) => set('unidade', v)} readOnly={readOnly} />
            </div>
          </TabsContent>

          {/* Detalhes */}
          <TabsContent value="detalhes" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-3 gap-x-6 gap-y-5">
              <Field id="peso" label="Peso (kg)" value={data.peso != null ? String(data.peso) : ''}
                onChange={(v) => set('peso', v ? parseFloat(v) || undefined : undefined)}
                readOnly={readOnly} type="number" />
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">Ativo</Label>
                {readOnly ? (
                  <Badge variant={data.ativo ? 'default' : 'secondary'} className="w-fit">
                    {data.ativo ? 'Sim' : 'Não'}
                  </Badge>
                ) : (
                  <label className="flex items-center gap-2 h-9 cursor-pointer">
                    <input type="checkbox" checked={data.ativo}
                      onChange={(e) => set('ativo', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300" />
                    <span className="text-sm">{data.ativo ? 'Sim' : 'Não'}</span>
                  </label>
                )}
              </div>
              {produto?.temDocumento !== undefined && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">Documento</Label>
                  <Badge variant={produto.temDocumento ? 'default' : 'secondary'} className="w-fit">
                    {produto.temDocumento ? 'Possui' : 'Não possui'}
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    );
  }
);
