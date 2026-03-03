import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useGruposStore } from '@/stores/engenharia/gruposStore';
import { NIVEL_LABELS, NIVEL_CHARS } from '@/types/engenharia/grupo.types';
import type { GrupoProduto, NivelGrupo } from '@/types/engenharia/grupo.types';

interface GrupoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupo?: GrupoProduto | null;
}

const EMPTY = {
  codigo: '',
  descricao: '',
  nivel: 'Coluna1' as NivelGrupo,
  qtdCaracteres: 2,
  pathDocumentos: '',
  ativo: true,
};

export function GrupoFormModal({ open, onOpenChange, grupo }: GrupoFormModalProps) {
  const createGrupo = useGruposStore((s) => s.createGrupo);
  const updateGrupo = useGruposStore((s) => s.updateGrupo);

  const [formData, setFormData] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  const isEditing = !!grupo;

  useEffect(() => {
    if (!open) { setReady(false); return; }
    if (grupo) {
      setFormData({
        codigo: grupo.codigo ?? '',
        descricao: grupo.descricao ?? '',
        nivel: grupo.nivel ?? 'Coluna1',
        qtdCaracteres: grupo.qtdCaracteres ?? NIVEL_CHARS[grupo.nivel] ?? 2,
        pathDocumentos: grupo.pathDocumentos ?? '',
        ativo: grupo.ativo !== false,
      });
    } else {
      setFormData({ ...EMPTY });
    }
    setErrors({});
    setReady(true);
  }, [open, grupo]);

  const handleNivelChange = (nivel: NivelGrupo) => {
    setFormData((prev) => ({
      ...prev,
      nivel,
      qtdCaracteres: NIVEL_CHARS[nivel],
    }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.codigo.trim()) e.codigo = 'Código é obrigatório';
    if (!formData.descricao.trim()) e.descricao = 'Descrição é obrigatória';
    if (formData.codigo.length > formData.qtdCaracteres) {
      e.codigo = `Código deve ter no máximo ${formData.qtdCaracteres} caracteres para ${NIVEL_LABELS[formData.nivel]}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload: any = {
      codigo: formData.codigo.trim(),
      descricao: formData.descricao.trim(),
      nivel: formData.nivel,
      qtdCaracteres: formData.qtdCaracteres,
      ativo: formData.ativo,
    };
    if (formData.pathDocumentos.trim()) payload.pathDocumentos = formData.pathDocumentos.trim();

    setIsSubmitting(true);
    try {
      if (isEditing && grupo) {
        await updateGrupo(grupo.id, payload);
      } else {
        await createGrupo(payload);
      }
      onOpenChange(false);
    } catch {
      // erro tratado no store
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (field: string, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));

  if (!ready) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Grupo' : 'Novo Grupo de Produto'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Atualize os dados do grupo' : 'Preencha os dados do novo grupo'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nível</Label>
            <div className="flex gap-2">
              {(['Coluna1', 'Coluna2', 'Coluna3'] as NivelGrupo[]).map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={formData.nivel === n ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleNivelChange(n)}
                  disabled={isEditing}
                  className={isEditing && formData.nivel !== n ? 'opacity-40' : ''}
                >
                  {NIVEL_LABELS[n]}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código * <span className="text-xs text-muted-foreground">({formData.qtdCaracteres} chars)</span></Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => set('codigo', e.target.value.toUpperCase())}
                maxLength={formData.qtdCaracteres}
              />
              {errors.codigo && <p className="text-sm text-destructive">{errors.codigo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtdCaracteres">Qtd Caracteres</Label>
              <Input
                id="qtdCaracteres"
                type="number"
                value={formData.qtdCaracteres}
                onChange={(e) => set('qtdCaracteres', parseInt(e.target.value) || 0)}
                min={1}
                max={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" value={formData.descricao} onChange={(e) => set('descricao', e.target.value)} />
            {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pathDocumentos">Path Documentos <span className="text-xs text-muted-foreground">(opcional — sobrescreve o path raiz)</span></Label>
            <Input
              id="pathDocumentos"
              value={formData.pathDocumentos}
              onChange={(e) => set('pathDocumentos', e.target.value)}
              placeholder="Ex: D:\Desenhos\Especiais"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => set('ativo', !!checked)}
            />
            <Label htmlFor="ativo" className="cursor-pointer">Ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Grupo'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
