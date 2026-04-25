import React, { useState } from 'react';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import Modal from '../components/Modal';
import UserEditForm from '../components/UserEditForm';
import { useToast } from '../components/Toast';

export default function UsersListPage({ roleFilter = 'todos' }) {
  const { data: allUsers = [], isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const itemsPerPage = 10;

  const users = allUsers.filter(u => {
    const matchesRole = roleFilter === 'todos' || u.role === roleFilter;
    const matchesSearch = u.Name.toLowerCase().includes(search.toLowerCase()) || 
                         u.Email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const currentData = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteMutation.mutateAsync(id);
        addToast('Usuário excluído com sucesso!', 'success');
      } catch (err) {
        addToast('Erro ao excluir usuário.', 'error');
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div className="h-10 w-48 bg-card rounded border animate-pulse" />
          <div className="h-10 w-32 bg-card rounded border animate-pulse" />
        </div>
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 border-b animate-pulse bg-secondary/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold capitalize">
            {roleFilter === 'todos' ? 'Todos os Usuários' : roleFilter + 's'}
          </h1>
          <p className="text-muted-foreground">Gerencie os acessos e perfis da plataforma.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium border hover:bg-secondary/80 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-card p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentData.map((user) => (
                <tr key={user.ID} className="hover:bg-secondary/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 border border-primary/20 overflow-hidden">
                        {user.Photo ? (
                          <img src={user.Photo} alt={user.Name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-bold text-sm">{user.Name.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{user.Name}</p>
                        <p className="text-xs text-muted-foreground">{user.Email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{user.Cpf || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">{user.Phone || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      user.EmailVerified 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                      {user.EmailVerified ? 'Verificado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.ID)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-secondary text-muted-foreground rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-secondary/20 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, users.length)}</span> de <span className="font-medium text-foreground">{users.length}</span> resultados
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-4">{currentPage} de {totalPages || 1}</span>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 border rounded-lg disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Perfil de Usuário"
        footer={
          <>
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium hover:underline"
            >
              Cancelar
            </button>
            <button 
              form="user-edit-form"
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg"
            >
              Salvar Alterações
            </button>
          </>
        }
      >
        <UserEditForm 
          user={selectedUser} 
          onSuccess={() => setIsEditModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
