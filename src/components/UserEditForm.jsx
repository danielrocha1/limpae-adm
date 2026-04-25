import React, { useState, useEffect } from 'react';
import { useUpdateUser } from '../hooks/useUsers';
import { useToast } from '../components/Toast';
import { Camera, User, Mail, Phone, Shield, Calendar, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export default function UserEditForm({ user, onSuccess }) {
  const { addToast } = useToast();
  const updateMutation = useUpdateUser();
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Cpf: '',
    Role: '',
    Photo: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        Name: user.Name || '',
        Email: user.Email || '',
        Phone: user.Phone?.toString() || '',
        Cpf: user.Cpf || '',
        Role: user.role || '',
        Photo: user.Photo || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: user.ID,
        data: {
          ...formData,
          Phone: parseInt(formData.Phone) || 0,
        }
      });
      addToast('Usuário atualizado com sucesso!', 'success');
      onSuccess?.();
    } catch (err) {
      addToast('Erro ao atualizar usuário.', 'error');
    }
  };

  return (
    <form id="user-edit-form" onSubmit={handleSubmit} className="space-y-8">
      {/* Profile Photo */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-secondary border-2 border-primary/20 flex items-center justify-center overflow-hidden">
            {formData.Photo ? (
              <img src={formData.Photo} alt={formData.Name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <button 
            type="button"
            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Clique para alterar a imagem de perfil</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Nome Completo
            </label>
            <input
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Email
            </label>
            <input
              name="Email"
              type="email"
              value={formData.Email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>
        </div>

        {/* Identification */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> Telefone
            </label>
            <input
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> CPF
            </label>
            <input
              name="Cpf"
              value={formData.Cpf}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Função (Role)
          </label>
          <select
            name="Role"
            value={formData.Role}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="cliente">Cliente</option>
            <option value="diarista">Diarista</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      </div>

      {/* Stats/Info Section */}
      <div className="p-4 bg-secondary/30 rounded-xl border border-dashed">
        <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" /> Informações do Sistema
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Criado em:</span>
            <span className="font-medium text-foreground">
              {user?.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString('pt-BR') : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Verificado:</span>
            <span className={cn(
              "font-medium",
              user?.EmailVerified ? "text-emerald-500" : "text-amber-500"
            )}>
              {user?.EmailVerified ? 'Sim' : 'Não'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>ID do Usuário:</span>
            <span className="font-mono text-foreground">#{user?.ID}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Usuário de Teste:</span>
            <span className="font-medium text-foreground">{user?.IsTestUser ? 'Sim' : 'Não'}</span>
          </div>
        </div>
      </div>
    </form>
  );
}
