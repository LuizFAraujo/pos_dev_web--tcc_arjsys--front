import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useProdutosStore } from '@/stores/cadastros/produtosStore';
import type { Produto, TipoProduto, UnidadeMedida } from '@/types/cadastros/produto.types';

interface ProdutoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto | null;
}

export function ProdutoFormModal({ open, onOpenChange, produto }: ProdutoFormModalProps) {
  const createProduto = useProdutosStore((state) => state.createProduto);
  const updateProduto = useProdutosStore((state) => state.updateProduto);
  const generateCodigo = useProdutosStore((state) => state.generateCodigo);

  const isEditing = !!produto;

  const [formData, setFormData] = useState({
    codigo: '',
    descricaoCurta: '',
    descricaoCompleta: '',
    tipo: 'FABRICADO' as TipoProduto,
    unidade: 'UN' as UnidadeMedida,
    pesoEstimado: '',
    tempoFabricacao: '',
    possuiDesenho: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (produto) {
      setFormData({
        codigo: produto.codigo,
        descricaoCurta: produto.descricaoCurta,
        descricaoCompleta: produto.descricaoCompleta || '',
        tipo: produto.tipo,
        unidade: produto.unidade,
        pesoEstimado: produto.pesoEstimado?.toString() || '',
        tempoFabricacao: produto.tempoFabricacao?.toString() || '',
        possuiDesenho: produto.possuiDesenho,
      });
    } else {
      setFormData({
        codigo: '',
        descricaoCurta: '',
        descricaoCompleta: '',
        tipo: 'FABRICADO',
        unidade: 'UN',
        pesoEstimado: '',
        tempoFabricacao: '',
        possuiDesenho: false,
      });
    }
    setErrors({});
  }, [produto, open]);

  const handleTipoChange = (tipo: TipoProduto) => {
    setFormData((prev) => ({ ...prev, tipo }));
    if (!isEditing) {
      const novoCodigo = generateCodigo(tipo);
      setFormData((prev) => ({ ...prev, codigo: novoCodigo }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo) newErrors.codigo = 'Código é obrigatório';
    if (formData.descricaoCurta.length < 3) newErrors.descricaoCurta = 'Descrição deve ter no mínimo 3 caracteres';
    if (formData.pesoEstimado && parseFloat(formData.pesoEstimado) < 0) newErrors.pesoEstimado = 'Peso deve ser >= 0';
    if (formData.tempoFabricacao && parseFloat(formData.tempoFabricacao) < 0) newErrors.tempoFabricacao = 'Tempo deve ser >= 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      codigo: formData.codigo,
      descricaoCurta: formData.descricaoCurta,
      descricaoCompleta: formData.descricaoCompleta || undefined,
      tipo: formData.tipo,
      unidade: formData.unidade,
      pesoEstimado: formData.pesoEstimado ? parseFloat(formData.pesoEstimado) : undefined,
      tempoFabricacao: formData.tempoFabricacao ? parseFloat(formData.tempoFabricacao) : undefined,
      possuiDesenho: formData.possuiDesenho,
    };

    if (isEditing && produto) {
      updateProduto(produto.id, payload);
    } else {
      createProduto(payload);
    }

    onOpenChange(false);
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
              <Select disabled={isEditing} value={formData.tipo} onValueChange={(value) => handleTipoChange(value as TipoProduto)}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FABRICADO">Fabricado</SelectItem>
                  <SelectItem value="COMPRADO">Comprado</SelectItem>
                  <SelectItem value="MATERIA_PRIMA">Matéria-Prima</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input id="codigo" value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} disabled={isEditing} className="font-mono" />
              {errors.codigo && <p className="text-sm text-destructive">{errors.codigo}</p>}
              <p className="text-sm text-muted-foreground">{isEditing ? 'Código não pode ser alterado' : 'Gerado automaticamente'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricaoCurta">Descrição Curta *</Label>
            <Input id="descricaoCurta" value={formData.descricaoCurta} onChange={(e) => setFormData({ ...formData, descricaoCurta: e.target.value })} placeholder="Ex: Trator Agrícola Completo" />
            {errors.descricaoCurta && <p className="text-sm text-destructive">{errors.descricaoCurta}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricaoCompleta">Descrição Completa</Label>
            <Textarea id="descricaoCompleta" value={formData.descricaoCompleta} onChange={(e) => setFormData({ ...formData, descricaoCompleta: e.target.value })} placeholder="Detalhes adicionais..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade *</Label>
              <Select value={formData.unidade} onValueChange={(value) => setFormData({ ...formData, unidade: value as UnidadeMedida })}>
                <SelectTrigger id="unidade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UN">UN - Unidade</SelectItem>
                  <SelectItem value="KG">KG - Quilograma</SelectItem>
                  <SelectItem value="M">M - Metro</SelectItem>
                  <SelectItem value="M2">M² - Metro Quadrado</SelectItem>
                  <SelectItem value="M3">M³ - Metro Cúbico</SelectItem>
                  <SelectItem value="L">L - Litro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pesoEstimado">Peso Estimado (kg)</Label>
              <Input id="pesoEstimado" type="number" step="0.01" value={formData.pesoEstimado} onChange={(e) => setFormData({ ...formData, pesoEstimado: e.target.value })} placeholder="0.00" />
              {errors.pesoEstimado && <p className="text-sm text-destructive">{errors.pesoEstimado}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tempoFabricacao">Tempo de Fabricação (horas)</Label>
            <Input id="tempoFabricacao" type="number" step="0.5" value={formData.tempoFabricacao} onChange={(e) => setFormData({ ...formData, tempoFabricacao: e.target.value })} placeholder="0" />
            {errors.tempoFabricacao && <p className="text-sm text-destructive">{errors.tempoFabricacao}</p>}
            <p className="text-sm text-muted-foreground">Tempo estimado para fabricar/montar</p>
          </div>

          <div className="flex items-center space-x-2 rounded-md border p-4">
            <Checkbox id="possuiDesenho" checked={formData.possuiDesenho} onCheckedChange={(checked) => setFormData({ ...formData, possuiDesenho: checked as boolean })} />
            <div className="space-y-1">
              <Label htmlFor="possuiDesenho" className="cursor-pointer">Possui Desenho Técnico</Label>
              <p className="text-sm text-muted-foreground">Marque se este produto possui desenho técnico cadastrado</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit">{isEditing ? 'Salvar' : 'Criar Produto'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}