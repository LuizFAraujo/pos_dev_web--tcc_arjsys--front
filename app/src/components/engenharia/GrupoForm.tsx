/**
 * GrupoForm.tsx - Form inline de cadastro/edição/visualização de grupo de produto
 *
 * Modos: view (readOnly), edit, new
 * Abas: Identificação | Configuração
 */

import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFormTabNavigation } from '@/hooks/useFormTabNavigation';
import type { GrupoProduto, GrupoProdutoFormData, NivelGrupo } from '@/types/engenharia/grupo.types';
import { NIVEL_LABELS } from '@/types/engenharia/grupo.types';
import type { PageMode } from '@/components/shared/PageShell';

export interface GrupoFormHandle {
  submit: () => Promise<boolean>;
}

interface GrupoFormProps {
  mode: Extract<PageMode, 'new' | 'edit' | 'view'>;
  grupo: GrupoProduto | null;
  onDirty: () => void;
  onSave: (data: GrupoProdutoFormData) => Promise<void>;
}

const EMPTY: GrupoProdutoFormData = {
  codigo: '', descricao: '', nivel: 'Coluna1',
  qtdCaracteres: 2, pathDocumentos: '', ativo: true,
};

const TABS = ['identificacao', 'configuracao'];

const FIELD_TAB: Record<string, string> = {
  codigo: 'identificacao', descricao: 'identificacao',
  nivel: 'identificacao', qtdCaracteres: 'identificacao',
  pathDocumentos: 'configuracao', ativo: 'configuracao',
};

const NIVEL_OPTIONS: NivelGrupo[] = ['Coluna1', 'Coluna2', 'Coluna3'];

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
        className={`h-9 text-sm bg-white dark:bg-slate-950 ${readOnly ?
          'cursor-default focus-visible:ring-0 focus-visible:ring-offset-0' : ''
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

export const GrupoForm = forwardRef<GrupoFormHandle, GrupoFormProps>(
  function GrupoForm({ mode, grupo, onDirty, onSave }, ref) {
    const readOnly = mode === 'view';
    const [data, setData] = useState<GrupoProdutoFormData>({ ...EMPTY });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { activeTab, setActiveTab, formFieldsRef, handleFieldsKeyDown } = useFormTabNavigation({
      tabs: TABS,
      defaultTab: 'identificacao',
    });

    useEffect(() => {
      setErrors({});
      setData(grupo ? {
        codigo: grupo.codigo ?? '',
        descricao: grupo.descricao ?? '',
        nivel: grupo.nivel ?? 'Coluna1',
        qtdCaracteres: grupo.qtdCaracteres ?? 2,
        pathDocumentos: grupo.pathDocumentos ?? '',
        ativo: grupo.ativo ?? true,
      } : { ...EMPTY });
    }, [grupo, mode]);

    useImperativeHandle(ref, () => ({
      submit: async () => {
        const e: Record<string, string> = {};
        if (!data.codigo.trim()) e.codigo = 'Código é obrigatório';
        if (!data.descricao.trim()) e.descricao = 'Descrição é obrigatória';
        if (!data.qtdCaracteres || data.qtdCaracteres < 1) e.qtdCaracteres = 'Qtd caracteres deve ser >= 1';
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
          codigo: data.codigo.trim(),
          descricao: data.descricao.trim(),
          nivel: data.nivel,
          qtdCaracteres: data.qtdCaracteres,
          pathDocumentos: data.pathDocumentos?.trim() || undefined,
          ativo: data.ativo,
        });
        return true;
      },
    }));

    const set = (field: keyof GrupoProdutoFormData, value: any) => {
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
              <TabsTrigger value="configuracao">Configuração</TabsTrigger>
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nivel" className="text-xs font-medium text-slate-500 dark:text-slate-400">Nível</Label>
                {readOnly ? (
                  <Input id="nivel" value={NIVEL_LABELS[data.nivel] || data.nivel} readOnly
                    className="h-9 text-sm bg-white dark:bg-slate-950 cursor-default focus-visible:ring-0 focus-visible:ring-offset-0" />
                ) : (
                  <select id="nivel" value={data.nivel}
                    onChange={(e) => set('nivel', e.target.value as NivelGrupo)}
                    className="h-9 text-sm rounded-md border border-input bg-white dark:bg-slate-950 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {NIVEL_OPTIONS.map((n) => (
                      <option key={n} value={n}>{NIVEL_LABELS[n]}</option>
                    ))}
                  </select>
                )}
              </div>
              <Field id="qtdCaracteres" label="Qtd Caracteres *"
                value={String(data.qtdCaracteres)}
                onChange={(v) => set('qtdCaracteres', parseInt(v) || 0)}
                readOnly={readOnly} type="number"
                error={errors.qtdCaracteres} />
            </div>
          </TabsContent>

          {/* Configuração */}
          <TabsContent value="configuracao" className="flex-1 overflow-auto mt-0 px-6 py-5">
            <div ref={formFieldsRef} onKeyDown={handleFieldsKeyDown}
              className="grid grid-cols-3 gap-x-6 gap-y-5">
              <Field id="pathDocumentos" label="Path Documentos"
                value={data.pathDocumentos ?? ''}
                onChange={(v) => set('pathDocumentos', v)} readOnly={readOnly}
                span="col-span-3" />
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
            </div>
          </TabsContent>

        </Tabs>
      </div>
    );
  }
);
