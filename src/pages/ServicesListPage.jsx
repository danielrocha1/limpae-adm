import React, { useState } from 'react';
import { useServices } from '../hooks/useServices';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  User as UserIcon,
  CheckCircle2,
  Clock3,
  XCircle,
  PlayCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  'pendente': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock3 },
  'aceito': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle2 },
  'em jornada': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: PlayCircle },
  'em serviço': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: PlayCircle },
  'concluído': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  'cancelado': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

export default function ServicesListPage() {
  const { data: services = [], isLoading } = useServices();
  const [search, setSearch] = useState('');

  const filteredServices = services.filter(s => 
    s.client?.Name?.toLowerCase().includes(search.toLowerCase()) ||
    s.diarist?.Name?.toLowerCase().includes(search.toLowerCase()) ||
    s.status?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-card rounded border" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-card rounded-xl border" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Serviços</h1>
        <p className="text-muted-foreground">Acompanhe todos os serviços agendados e realizados.</p>
      </div>

      <div className="bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, diarista ou status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const StatusIcon = statusConfig[service.status]?.icon || Clock3;
          return (
            <div key={service.ID} className="bg-card border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
              {/* Header Status */}
              <div className={cn(
                "px-4 py-2 flex items-center justify-between border-b",
                statusConfig[service.status]?.color
              )}>
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{service.status}</span>
                </div>
                <span className="text-xs font-medium">#{service.ID}</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Users involved */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Cliente</p>
                    <p className="text-sm font-semibold truncate">{service.client?.Name || 'N/A'}</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Diarista</p>
                    <p className="text-sm font-semibold truncate">{service.diarist?.Name || 'Aguardando'}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    {service.scheduled_at ? format(new Date(service.scheduled_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : '-'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    {service.duration_hours}h de serviço
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span className="truncate">{service.address?.street}, {service.address?.number}</span>
                  </div>
                </div>

                {/* Footer Price */}
                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center text-lg font-bold text-primary">
                    <DollarSign className="w-5 h-5" />
                    R$ {service.total_price?.toFixed(2)}
                  </div>
                  <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    VER DETALHES
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
          <p className="text-muted-foreground">Nenhum serviço encontrado com esses filtros.</p>
        </div>
      )}
    </div>
  );
}
