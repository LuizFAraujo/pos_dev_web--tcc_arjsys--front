import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useProdutosStore } from '@/stores/engenharia/produtosStore';
import type { Produto, TipoProduto, UnidadeMedida } from '@/types/engenharia/produto.types';
import { TIPO_PRODUTO_LABELS, UNIDADE_LABELS } from '@/types/engenharia/produto.types';

interface ProdutoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto | null;
}

export function ProdutoFormModal({ open, onOpenChange, produto }: ProdutoFormModalProps) {
  const createProduto = useProdutosStore((s) => s.createProduto);
  const updateProduto = useProdutosStore((s) => s.updateProduto);

  const isEditing = !!produto;

  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    descricaoCompleta: '',
    tipo: 'Fabricado' as TipoProduto,
    unidade: 'UN' as UnidadeMedida,
    peso: '',
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (produto) {
      setFormData({
        codigo: produto.codigo,
        descricao: produto.descricao,
        descricaoCompleta: produto.descricaoCompleta || '',
        tipo: produto.tipo,
        unidade: produto.unidade,
        peso: produto.peso?.toString() || '',
        ativo: produto.ativo,
      });
    } else {
      setFormData({
        codigo: '',
        descricao: '',
        descricaoCompleta: '',
        tipo: 'Fabricado',
        unidade: 'UN',
        peso: '',
        ativo: true,
      });
    }
    setErrors({});
  }, [produto, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.codigo.trim()) newErrors.codigo = 'Código é obrigatório';
    if (formData.descricao.length < 3) newErrors.descricao = 'Descrição deve ter no mínimo 3 caracteres';
    if (formData.peso && parseFloat(formData.peso) < 0) newErrors.peso = 'Peso deve ser >= 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      codigo: formData.codigo,
      descricao: formData.descricao,
      descricaoCompleta: formData.descricaoCompleta || undefined,
      tipo: formData.tipo,
      unidade: formData.unidade,
      peso: formData.peso ? parseFloat(formData.peso) : undefined,
      ativo: formData.ativo,
    };

    setIsSubmitting(true);
    try {
      if (isEditing && produto) {
        await updateProduto(produto.id, payload);
      } else {
        await createProduto(payload);
      }
      onOpenChange(false);
    } catch {
      // Erro já tratado no store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select disabled={isEditing} value={formData.tipo} onValueChange={(v) => setFormData((prev) => ({ ...prev, tipo: v as TipoProduto }))}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_PRODUTO_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input id="codigo" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} disabled={isEditing} className="font-mono" />
              {errors.codigo && <p className="text-sm text-destructive">{errors.codigo}</p>}
              {isEditing && <p className="text-sm text-muted-foreground">Código não pode ser alterado</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Ex: VIATURA SPIN GM07" />
            {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricaoCompleta">Descrição Completa</Label>
            <Textarea id="descricaoCompleta" value={formData.descricaoCompleta} onChange={(e) => setFormData({ ...formData, descricaoCompleta: e.target.value })} placeholder="Detalhes adicionais..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade *</Label>
              <Select value={formData.unidade} onValueChange={(v) => setFormData({ ...formData, unidade: v as UnidadeMedida })}>
                <SelectTrigger id="unidade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIDADE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{value} - {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input id="peso" type="number" step="0.01" value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} placeholder="0.00" />
              {errors.peso && <p className="text-sm text-destructive">{errors.peso}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2 rounded-md border p-4">
            <Checkbox id="ativo" checked={formData.ativo} onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked as boolean })} />
            <div className="space-y-1">
              <Label htmlFor="ativo" className="cursor-pointer">Produto Ativo</Label>
              <p className="text-sm text-muted-foreground">Desmarque para inativar o produto</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
