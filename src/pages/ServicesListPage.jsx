import React, { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  PlayCircle,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import { useServices } from "../hooks/useServices";
import Modal from "../components/Modal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";

const statusConfig = {
  pendente: { className: "bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: Clock },
  aceito: { className: "bg-sky-500/10 text-sky-700 dark:text-sky-300", icon: CheckCircle2 },
  "em jornada": { className: "bg-violet-500/10 text-violet-700 dark:text-violet-300", icon: PlayCircle },
  "em servico": { className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300", icon: PlayCircle },
  "em serviço": { className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300", icon: PlayCircle },
  concluido: { className: "bg-teal-500/10 text-teal-700 dark:text-teal-300", icon: CheckCircle2 },
  concluído: { className: "bg-teal-500/10 text-teal-700 dark:text-teal-300", icon: CheckCircle2 },
  cancelado: { className: "bg-rose-500/10 text-rose-700 dark:text-rose-300", icon: XCircle },
};

function get(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) return object[key];
  }
  return undefined;
}

function getNested(object, first, second) {
  const value = get(object, first, first?.toLowerCase?.());
  return get(value, second, second?.toLowerCase?.());
}

function statusOf(service) {
  return String(get(service, "Status", "status") || "sem status").toLowerCase();
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function serviceAddress(service) {
  const address = get(service, "Address", "address");
  const street = get(address, "Street", "street") || "Endereco nao informado";
  const number = get(address, "Number", "number");
  return number ? `${street}, ${number}` : street;
}

export default function ServicesListPage() {
  const { data: services = [], isLoading } = useServices();
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  const filteredServices = useMemo(() => {
    const term = search.toLowerCase();
    return Array.isArray(services)
      ? services.filter((service) => {
          const clientName = getNested(service, "Client", "Name") || getNested(service, "client", "Name") || "";
          const diaristName = getNested(service, "Diarist", "Name") || getNested(service, "diarist", "Name") || "";
          return [clientName, diaristName, statusOf(service), serviceAddress(service)].join(" ").toLowerCase().includes(term);
        })
      : [];
  }, [services, search]);

  const totals = {
    all: Array.isArray(services) ? services.length : 0,
    finished: filteredServices.filter((service) => ["concluido", "concluído"].includes(statusOf(service))).length,
    canceled: filteredServices.filter((service) => statusOf(service) === "cancelado").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-72" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-white/[0.04] dark:ring-white/10">
        <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">Operacao de campo</Badge>
        <h1 className="mt-4 text-4xl font-black tracking-normal">Serviços</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Acompanhe agenda, status, valor, cliente e diarista de cada serviço.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Total" value={totals.all} />
          <Metric label="Concluidos" value={totals.finished} tone="teal" />
          <Metric label="Cancelados" value={totals.canceled} tone="rose" />
        </div>
      </section>

      <Card className="border-0 bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-lg pl-10"
            placeholder="Buscar por cliente, diarista, endereco ou status"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredServices.map((service) => {
          const id = get(service, "ID", "id");
          const status = statusOf(service);
          const config = statusConfig[status] || statusConfig.pendente;
          const StatusIcon = config.icon;
          const clientName = getNested(service, "Client", "Name") || getNested(service, "client", "Name") || "N/A";
          const diaristName = getNested(service, "Diarist", "Name") || getNested(service, "diarist", "Name") || "Aguardando";
          return (
            <Card key={id} className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white/[0.04] dark:ring-white/10">
              <div className={`flex items-center justify-between border-b p-4 ${config.className}`}>
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-xs font-black uppercase tracking-wide">{status}</span>
                </div>
                <span className="font-mono text-xs">#{id}</span>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <PersonBlock label="Cliente" value={clientName} />
                  <div className="h-10 w-px bg-border" />
                  <PersonBlock label="Diarista" value={diaristName} />
                </div>

                <div className="space-y-3 border-t pt-4 text-sm text-muted-foreground">
                  <InfoRow icon={Calendar} value={dateTime(get(service, "ScheduledAt", "scheduled_at"))} />
                  <InfoRow icon={Clock} value={`${get(service, "DurationHours", "duration_hours") || "-"}h de servico`} />
                  <InfoRow icon={MapPin} value={serviceAddress(service)} />
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center text-xl font-black text-teal-500">
                    <DollarSign className="h-5 w-5" />
                    {money(get(service, "TotalPrice", "total_price"))}
                  </div>
                  <Button variant="outline" className="rounded-lg text-xs font-black" onClick={() => setSelectedService(service)}>
                    Ver detalhes
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="rounded-xl border border-dashed bg-white py-16 text-center text-muted-foreground dark:bg-white/[0.04]">
          Nenhum serviço encontrado com esses filtros.
        </div>
      )}

      <ServiceDetailsModal service={selectedService} onClose={() => setSelectedService(null)} />
    </div>
  );
}

function Metric({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-950 dark:bg-white/[0.04] dark:text-white",
    teal: "bg-teal-50 text-teal-950 dark:bg-teal-500/10 dark:text-teal-200",
    rose: "bg-rose-50 text-rose-950 dark:bg-rose-500/10 dark:text-rose-200",
  };
  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-sm opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function PersonBlock({ label, value }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-black">{value}</p>
    </div>
  );
}

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-teal-500" />
      <span className="truncate">{value}</span>
    </div>
  );
}

function ServiceDetailsModal({ service, onClose }) {
  if (!service) return null;
  const status = statusOf(service);
  return (
    <Modal isOpen={Boolean(service)} onClose={onClose} title={`Serviço #${get(service, "ID", "id") || ""}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <Detail label="Status" value={status} />
        <Detail label="Valor" value={money(get(service, "TotalPrice", "total_price"))} />
        <Detail label="Cliente" value={getNested(service, "Client", "Name") || getNested(service, "client", "Name") || "N/A"} />
        <Detail label="Diarista" value={getNested(service, "Diarist", "Name") || getNested(service, "diarist", "Name") || "Aguardando"} />
        <Detail label="Data" value={dateTime(get(service, "ScheduledAt", "scheduled_at"))} />
        <Detail label="Duração" value={`${get(service, "DurationHours", "duration_hours") || "-"}h`} />
        <Detail label="Endereço" value={serviceAddress(service)} className="md:col-span-2" />
      </div>
    </Modal>
  );
}

function Detail({ label, value, className = "" }) {
  return (
    <div className={`rounded-lg border bg-slate-50 p-4 dark:bg-white/[0.04] ${className}`}>
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{value || "-"}</p>
    </div>
  );
}
