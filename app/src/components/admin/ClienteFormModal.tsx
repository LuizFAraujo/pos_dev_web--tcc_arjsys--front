import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClientesStore } from '@/stores/admin/clientesStore';
import type { Cliente } from '@/types/admin/cliente.types';

interface ClienteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
}

const EMPTY = {
  nome: '', cpfCnpj: '', razaoSocial: '', inscricaoEstadual: '',
  contatoComercial: '', telefone: '', email: '', endereco: '',
  cidade: '', estado: '', cep: '',
};

export function ClienteFormModal({ open, onOpenChange, cliente }: ClienteFormModalProps) {
  const createCliente = useClientesStore((s) => s.createCliente);
  const updateCliente = useClientesStore((s) => s.updateCliente);

  const [formData, setFormData] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    if (cliente) {
      setFormData({
        nome: cliente.nome ?? '',
        cpfCnpj: cliente.cpfCnpj ?? '',
        razaoSocial: cliente.razaoSocial ?? '',
        inscricaoEstadual: cliente.inscricaoEstadual ?? '',
        contatoComercial: cliente.contatoComercial ?? '',
        telefone: cliente.telefone ?? '',
        email: cliente.email ?? '',
        endereco: cliente.endereco ?? '',
        cidade: cliente.cidade ?? '',
        estado: cliente.estado ?? '',
        cep: cliente.cep ?? '',
      });
    } else {
      setFormData({ ...EMPTY });
    }
    setErrors({});
    setReady(true);
  }, [open, cliente]);

  const isEditing = !!cliente;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.nome.trim()) e.nome = 'Nome é obrigatório';
    if (formData.email && !formData.email.includes('@')) e.email = 'E-mail inválido';
    if (formData.estado && formData.estado.length !== 2) e.estado = 'UF deve ter 2 letras';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload: any = { nome: formData.nome.trim() };
    if (formData.cpfCnpj.trim()) payload.cpfCnpj = formData.cpfCnpj.trim();
    if (formData.razaoSocial.trim()) payload.razaoSocial = formData.razaoSocial.trim();
    if (formData.inscricaoEstadual.trim()) payload.inscricaoEstadual = formData.inscricaoEstadual.trim();
    if (formData.contatoComercial.trim()) payload.contatoComercial = formData.contatoComercial.trim();
    if (formData.telefone.trim()) payload.telefone = formData.telefone.trim();
    if (formData.email.trim()) payload.email = formData.email.trim();
    if (formData.endereco.trim()) payload.endereco = formData.endereco.trim();
    if (formData.cidade.trim()) payload.cidade = formData.cidade.trim();
    if (formData.estado.trim()) payload.estado = formData.estado.trim().toUpperCase();
    if (formData.cep.trim()) payload.cep = formData.cep.trim();

    setIsSubmitting(true);
    try {
      if (isEditing && cliente) {
        await updateCliente(cliente.id, payload);
      } else {
        await createCliente(payload);
      }
      onOpenChange(false);
    } catch {
      // erro tratado no store
    } finally {
      setIsSubmitting(false);
    }
  };

  const set = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  if (!ready) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Atualize os dados do cliente' : 'Preencha os dados do novo cliente'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={formData.nome} onChange={(e) => set('nome', e.target.value)} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input id="cpfCnpj" value={formData.cpfCnpj} onChange={(e) => set('cpfCnpj', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="razaoSocial">Razão Social</Label>
              <Input id="razaoSocial" value={formData.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
              <Input id="inscricaoEstadual" value={formData.inscricaoEstadual} onChange={(e) => set('inscricaoEstadual', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contatoComercial">Contato Comercial</Label>
              <Input id="contatoComercial" value={formData.contatoComercial} onChange={(e) => set('contatoComercial', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={formData.telefone} onChange={(e) => set('telefone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => set('email', e.target.value)} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" value={formData.endereco} onChange={(e) => set('endereco', e.target.value)} />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={formData.cidade} onChange={(e) => set('cidade', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">UF</Label>
              <Input id="estado" maxLength={2} value={formData.estado} onChange={(e) => set('estado', e.target.value.toUpperCase())} />
              {errors.estado && <p className="text-sm text-destructive">{errors.estado}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" value={formData.cep} onChange={(e) => set('cep', e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Cliente'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
