import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFuncionariosStore } from '@/stores/admin/funcionariosStore';
import type { Funcionario } from '@/types/admin/funcionario.types';

interface FuncionarioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionario?: Funcionario | null;
}

const EMPTY = {
  nome: '', usuario: '', senha: '', cpfCnpj: '', cargo: '', setor: '',
  telefone: '', email: '', endereco: '', cidade: '', estado: '', cep: '',
};

export function FuncionarioFormModal({ open, onOpenChange, funcionario }: FuncionarioFormModalProps) {
  const createFuncionario = useFuncionariosStore((s) => s.createFuncionario);
  const updateFuncionario = useFuncionariosStore((s) => s.updateFuncionario);

  const [formData, setFormData] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }
    if (funcionario) {
      setFormData({
        nome: funcionario.nome ?? '',
        usuario: funcionario.usuario ?? '',
        senha: '',
        cpfCnpj: funcionario.cpfCnpj ?? '',
        cargo: funcionario.cargo ?? '',
        setor: funcionario.setor ?? '',
        telefone: funcionario.telefone ?? '',
        email: funcionario.email ?? '',
        endereco: funcionario.endereco ?? '',
        cidade: funcionario.cidade ?? '',
        estado: funcionario.estado ?? '',
        cep: funcionario.cep ?? '',
      });
    } else {
      setFormData({ ...EMPTY });
    }
    setErrors({});
    setReady(true);
  }, [open, funcionario]);

  const isEditing = !!funcionario;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!formData.usuario.trim()) e.usuario = 'Usuário é obrigatório';
    if (!isEditing && !formData.senha.trim()) e.senha = 'Senha é obrigatória para novo funcionário';
    if (formData.email && !formData.email.includes('@')) e.email = 'E-mail inválido';
    if (formData.estado && formData.estado.length !== 2) e.estado = 'UF deve ter 2 letras';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload: any = {
      nome: formData.nome.trim(),
      usuario: formData.usuario.trim(),
    };
    if (formData.senha.trim()) payload.senha = formData.senha;
    if (formData.cpfCnpj.trim()) payload.cpfCnpj = formData.cpfCnpj.trim();
    if (formData.cargo.trim()) payload.cargo = formData.cargo.trim();
    if (formData.setor.trim()) payload.setor = formData.setor.trim();
    if (formData.telefone.trim()) payload.telefone = formData.telefone.trim();
    if (formData.email.trim()) payload.email = formData.email.trim();
    if (formData.endereco.trim()) payload.endereco = formData.endereco.trim();
    if (formData.cidade.trim()) payload.cidade = formData.cidade.trim();
    if (formData.estado.trim()) payload.estado = formData.estado.trim().toUpperCase();
    if (formData.cep.trim()) payload.cep = formData.cep.trim();

    setIsSubmitting(true);
    try {
      if (isEditing && funcionario) {
        await updateFuncionario(funcionario.id, payload);
      } else {
        await createFuncionario(payload);
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
          <DialogTitle>{isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Atualize os dados do funcionário' : 'Preencha os dados do novo funcionário'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={formData.nome} onChange={(e) => set('nome', e.target.value)} />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário * {isEditing && <span className="text-xs text-muted-foreground">(não editável)</span>}</Label>
              <Input id="usuario" value={formData.usuario} onChange={(e) => set('usuario', e.target.value)} disabled={isEditing} className={isEditing ? 'opacity-60' : ''} />
              {errors.usuario && <p className="text-sm text-destructive">{errors.usuario}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">{isEditing ? 'Nova Senha' : 'Senha *'}</Label>
              <Input id="senha" type="password" value={formData.senha} onChange={(e) => set('senha', e.target.value)} placeholder={isEditing ? 'Deixe vazio para manter' : ''} />
              {errors.senha && <p className="text-sm text-destructive">{errors.senha}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
              <Input id="cpfCnpj" value={formData.cpfCnpj} onChange={(e) => set('cpfCnpj', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input id="cargo" value={formData.cargo} onChange={(e) => set('cargo', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Input id="setor" value={formData.setor} onChange={(e) => set('setor', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={formData.telefone} onChange={(e) => set('telefone', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => set('email', e.target.value)} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Funcionário'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
