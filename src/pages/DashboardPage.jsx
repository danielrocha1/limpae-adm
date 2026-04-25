import React from 'react';
import { useUsers } from '../hooks/useUsers';
import { 
  Users as UsersIcon, 
  UserRound, 
  Briefcase, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardPage() {
  const { data: users = [], isLoading } = useUsers();

  const stats = [
    { 
      name: 'Total de Usuários', 
      value: users.length, 
      icon: UsersIcon, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      description: 'Crescimento de 12% este mês'
    },
    { 
      name: 'Total de Clientes', 
      value: users.filter(u => u.role === 'cliente').length, 
      icon: UserRound, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      description: '85% ativos na plataforma'
    },
    { 
      name: 'Total de Diaristas', 
      value: users.filter(u => u.role === 'diarista').length, 
      icon: Briefcase, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      description: 'Média de 4.8 estrelas'
    },
    { 
      name: 'Novos Cadastros', 
      value: users.filter(u => {
        const date = new Date(u.CreatedAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length, 
      icon: TrendingUp, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      description: 'Últimos 30 dias'
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-card rounded-xl border" />
          ))}
        </div>
        <div className="h-[400px] bg-card rounded-xl border" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao centro de controle da Limpae.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <Icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <span className="text-xs font-medium text-emerald-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.5%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Atividades Recentes</h2>
            <button className="text-sm text-primary font-medium hover:underline">Ver tudo</button>
          </div>
          <div className="divide-y">
            {users.slice(0, 5).map((user) => (
              <div key={user.ID} className="p-4 flex items-center hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  {user.Photo ? (
                    <img src={user.Photo} alt={user.Name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold text-sm">
                      {user.Name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.Name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.Email}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                    user.role === 'diarista' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {user.role}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(user.CreatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">Saúde do Sistema</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse" />
                <span className="text-sm font-medium">Backend API</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3" />
                <span className="text-sm font-medium">Banco de Dados</span>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-3" />
                <span className="text-sm font-medium">Armazenamento</span>
              </div>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="pt-6 border-t mt-6">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Uso de CPU</span>
                <span>42%</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[42%]" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Uso de Memória</span>
                <span>68%</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[68%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
