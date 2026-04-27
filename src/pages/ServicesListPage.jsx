import React, { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, DollarSign, MapPin, PlayCircle, Search, SlidersHorizontal, X, XCircle } from "lucide-react";
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

const pageSize = 9;
const allStatusFilter = "todos";
const emptyFilters = {
  id: "",
  client: "",
  diarist: "",
  amountMin: "",
  amountMax: "",
  dateFrom: "",
  dateTo: "",
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

function yesNo(value) {
  return value ? "Sim" : "Nao";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function userValue(user, key) {
  const snake = key.replace(/[A-Z]/g, (letter, index) => `${index ? "_" : ""}${letter.toLowerCase()}`);
  return get(user, key, key?.toLowerCase?.(), snake);
}

function addressValue(address, key) {
  const snake = key.replace(/[A-Z]/g, (letter, index) => `${index ? "_" : ""}${letter.toLowerCase()}`);
  return get(address, key, key?.toLowerCase?.(), snake);
}

function serviceAddress(service) {
  const address = get(service, "Address", "address");
  const street = get(address, "Street", "street") || "Endereco nao informado";
  const number = get(address, "Number", "number");
  return number ? `${street}, ${number}` : street;
}

function normalizeFilters(filters) {
  return {
    id: String(filters.id || "").trim(),
    client: String(filters.client || "").trim(),
    diarist: String(filters.diarist || "").trim(),
    amountMin: String(filters.amountMin || "").trim(),
    amountMax: String(filters.amountMax || "").trim(),
    dateFrom: String(filters.dateFrom || "").trim(),
    dateTo: String(filters.dateTo || "").trim(),
  };
}

function countActiveFilters(filters) {
  return Object.values(filters).filter(Boolean).length;
}

export default function ServicesListPage() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [statusFilter, setStatusFilter] = useState(allStatusFilter);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const { data: servicePage, isLoading } = useServices({
    page,
    page_size: pageSize,
    search: appliedSearch.trim() || undefined,
  });
  const services = servicePage?.items || [];
  const pagination = servicePage?.pagination;

  const statusOptions = useMemo(() => {
    const counts = services.reduce((accumulator, service) => {
      const status = statusOf(service);
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    }, {});

    return [
      { value: allStatusFilter, label: "Todos", count: services.length },
      ...Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
        .map(([value, count]) => ({ value, label: value, count })),
    ];
  }, [services]);

  const visibleServices = useMemo(() => {
    return services.filter((service) => {
      if (statusFilter !== allStatusFilter && statusOf(service) !== statusFilter) {
        return false;
      }

      const serviceId = String(get(service, "ID", "id") || "");
      if (appliedFilters.id && !serviceId.includes(appliedFilters.id)) {
        return false;
      }

      const clientName = normalizeText(getNested(service, "Client", "Name") || getNested(service, "client", "Name"));
      if (appliedFilters.client && !clientName.includes(normalizeText(appliedFilters.client))) {
        return false;
      }

      const diaristName = normalizeText(getNested(service, "Diarist", "Name") || getNested(service, "diarist", "Name"));
      if (appliedFilters.diarist && !diaristName.includes(normalizeText(appliedFilters.diarist))) {
        return false;
      }

      const totalPrice = Number(get(service, "TotalPrice", "total_price") || 0);
      const minAmount = appliedFilters.amountMin === "" ? null : Number(appliedFilters.amountMin);
      const maxAmount = appliedFilters.amountMax === "" ? null : Number(appliedFilters.amountMax);
      if (minAmount !== null && !Number.isNaN(minAmount) && totalPrice < minAmount) {
        return false;
      }
      if (maxAmount !== null && !Number.isNaN(maxAmount) && totalPrice > maxAmount) {
        return false;
      }

      const scheduledAt = get(service, "ScheduledAt", "scheduled_at");
      const scheduledDate = scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 10) : "";
      if (appliedFilters.dateFrom && (!scheduledDate || scheduledDate < appliedFilters.dateFrom)) {
        return false;
      }
      if (appliedFilters.dateTo && (!scheduledDate || scheduledDate > appliedFilters.dateTo)) {
        return false;
      }

      return true;
    });
  }, [appliedFilters, services, statusFilter]);

  const visibleTotals = useMemo(() => {
    return {
      all: visibleServices.length,
      finished: visibleServices.filter((service) => ["concluido", "concluído", "concluã­do"].includes(statusOf(service))).length,
      canceled: visibleServices.filter((service) => statusOf(service) === "cancelado").length,
    };
  }, [visibleServices]);

  const totalPages = Math.max(1, pagination?.total_pages ?? Math.ceil(services.length / pageSize));
  const activeFilterCount = countActiveFilters(appliedFilters);

  useEffect(() => {
    if (pagination?.page && pagination.page !== page) {
      setPage(pagination.page);
    }
  }, [page, pagination?.page]);

  useEffect(() => {
    if (!isFilterDrawerOpen) return undefined;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsFilterDrawerOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isFilterDrawerOpen]);

  function applySearch(event) {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  }

  function openFilterDrawer() {
    setDraftFilters(appliedFilters);
    setIsFilterDrawerOpen(true);
  }

  function applyDrawerFilters() {
    setAppliedFilters(normalizeFilters(draftFilters));
    setPage(1);
    setIsFilterDrawerOpen(false);
  }

  function clearDrawerFilters() {
    setDraftFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
    setIsFilterDrawerOpen(false);
  }

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
        <h1 className="mt-4 text-4xl font-black tracking-normal">Servicos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Acompanhe agenda, status, valor, cliente e diarista de cada servico.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Visiveis" value={visibleTotals.all} />
          <Metric label="Concluidos" value={visibleTotals.finished} tone="teal" />
          <Metric label="Cancelados" value={visibleTotals.canceled} tone="rose" />
        </div>
      </section>

      <Card className="border-0 bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="space-y-4">
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={applySearch}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 rounded-lg pl-10"
                placeholder="Buscar por cliente, diarista, endereco ou status"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button className="h-11 rounded-lg bg-slate-950 px-4 text-white hover:bg-slate-800 dark:bg-teal-400 dark:text-slate-950" type="submit">
                Buscar
              </Button>
              <Button variant="outline" className="h-11 rounded-lg px-4 font-black" onClick={openFilterDrawer}>
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeFilterCount > 0 ? (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] dark:bg-white/10">{activeFilterCount}</span>
                ) : null}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isActive = statusFilter === option.value;
              return (
                <Button
                  key={option.value}
                  variant="outline"
                  className={`h-9 rounded-full px-3 text-xs font-black ${isActive ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800 hover:text-white dark:border-teal-400 dark:bg-teal-400 dark:text-slate-950 dark:hover:bg-teal-300" : "bg-slate-50 dark:bg-white/[0.04]"}`}
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? "bg-white/15 text-white dark:bg-slate-950/10 dark:text-slate-950" : "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>
                    {option.count}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {visibleServices.map((service) => {
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

      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={visibleServices.length}
        itemLabel="servicos"
        helperText={statusFilter === allStatusFilter ? "Filtrados pela busca, drawer e pagina atual" : `Status ativo: ${statusFilter}`}
        onPrevious={() => setPage((value) => Math.max(1, value - 1))}
        onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
      />

      {visibleServices.length === 0 && (
        <div className="rounded-xl border border-dashed bg-white py-16 text-center text-muted-foreground dark:bg-white/[0.04]">
          Nenhum servico encontrado com esses filtros.
        </div>
      )}

      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        filters={draftFilters}
        onChange={setDraftFilters}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApply={applyDrawerFilters}
        onClear={clearDrawerFilters}
      />

      <ServiceDetailsModal service={selectedService} onClose={() => setSelectedService(null)} />
    </div>
  );
}

function PaginationBar({ page, totalPages, totalItems, itemLabel, helperText, onPrevious, onNext }) {
  if (totalItems === 0) return null;
  return (
    <Card className="border-0 bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Exibindo {totalItems} {itemLabel} filtrados
          </p>
          {helperText ? <p className="mt-1 text-xs text-muted-foreground">{helperText}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={onPrevious} title="Pagina anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="rounded-lg border bg-background px-3 py-2 text-sm font-semibold">
            Pagina {page} de {totalPages}
          </span>
          <Button variant="outline" size="icon" disabled={page === totalPages} onClick={onNext} title="Proxima pagina">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
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

function FilterDrawer({ isOpen, filters, onChange, onClose, onApply, onClear }) {
  if (!isOpen) return null;

  function updateField(field, value) {
    onChange((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-in slide-in-from-right flex-col border-l bg-white shadow-2xl dark:bg-slate-950">
        <div className="flex items-center justify-between border-b bg-slate-950 p-5 text-white dark:bg-slate-900">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Filtro avancado</p>
            <h3 className="mt-1 text-xl font-black">Refinar servicos</h3>
          </div>
          <Button variant="outline" className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={onClose}>
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <FilterField label="ID do servico">
            <Input value={filters.id} onChange={(event) => updateField("id", event.target.value)} placeholder="Ex.: 145" />
          </FilterField>

          <FilterField label="Cliente">
            <Input value={filters.client} onChange={(event) => updateField("client", event.target.value)} placeholder="Nome do cliente" />
          </FilterField>

          <FilterField label="Diarista">
            <Input value={filters.diarist} onChange={(event) => updateField("diarist", event.target.value)} placeholder="Nome da diarista" />
          </FilterField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FilterField label="Valor minimo">
              <Input type="number" step="0.01" value={filters.amountMin} onChange={(event) => updateField("amountMin", event.target.value)} placeholder="0,00" />
            </FilterField>
            <FilterField label="Valor maximo">
              <Input type="number" step="0.01" value={filters.amountMax} onChange={(event) => updateField("amountMax", event.target.value)} placeholder="500,00" />
            </FilterField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FilterField label="Data inicial">
              <Input type="date" value={filters.dateFrom} onChange={(event) => updateField("dateFrom", event.target.value)} />
            </FilterField>
            <FilterField label="Data final">
              <Input type="date" value={filters.dateTo} onChange={(event) => updateField("dateTo", event.target.value)} />
            </FilterField>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t bg-slate-50 p-5 dark:bg-white/[0.03]">
          <Button variant="outline" className="rounded-lg" onClick={onClear}>
            Limpar
          </Button>
          <Button className="rounded-lg bg-slate-950 text-white hover:bg-slate-800 dark:bg-teal-400 dark:text-slate-950" onClick={onApply}>
            Aplicar filtros
          </Button>
        </div>
      </aside>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ServiceDetailsModal({ service, onClose }) {
  if (!service) return null;
  const status = statusOf(service);
  const client = get(service, "Client", "client");
  const diarist = get(service, "Diarist", "diarist");
  const address = get(service, "Address", "address");
  const offer = get(service, "Offer", "offer");
  const review = get(service, "Review", "review", "reviews");
  return (
    <Modal isOpen={Boolean(service)} onClose={onClose} title={`Servico #${get(service, "ID", "id") || ""}`}>
      <div className="space-y-6">
        <Section title="Resumo do servico">
          <div className="grid gap-3 md:grid-cols-4">
            <Detail label="ID do servico" value={get(service, "ID", "id")} tone="slate" />
            <Detail label="Status" value={status} tone="amber" />
            <Detail label="Valor total" value={money(get(service, "TotalPrice", "total_price"))} tone="teal" />
            <Detail label="Duracao" value={`${get(service, "DurationHours", "duration_hours") || "-"}h`} tone="sky" />
            <Detail label="Tipo" value={get(service, "ServiceType", "service_type")} className="md:col-span-2" />
            <Detail label="Agendado para" value={dateTime(get(service, "ScheduledAt", "scheduled_at"))} />
            <Detail label="Concluido em" value={dateTime(get(service, "CompletedAt", "completed_at"))} />
            <Detail label="Criado em" value={dateTime(get(service, "CreatedAt", "created_at"))} />
            <Detail label="Tem pets" value={yesNo(get(service, "HasPets", "has_pets"))} />
            <Detail label="Quartos" value={get(service, "RoomCount", "room_count")} />
            <Detail label="Banheiros" value={get(service, "BathroomCount", "bathroom_count")} />
          </div>
        </Section>

        <Section title="Observacoes e motivos">
          <div className="grid gap-3 md:grid-cols-3">
            <Detail label="Observacoes" value={get(service, "Observations", "observations")} />
            <Detail label="Motivo de cancelamento" value={get(service, "CancelReason", "cancel_reason")} />
            <Detail label="Motivo de rejeicao" value={get(service, "RejectionReason", "rejection_reason")} />
          </div>
        </Section>

        <Section title="Pessoas vinculadas">
          <div className="grid gap-4 md:grid-cols-2">
            <UserPanel title="Cliente" user={client} />
            <UserPanel title="Diarista" user={diarist} />
          </div>
        </Section>

        <Section title="Endereco">
          <AddressPanel address={address} />
        </Section>

        <Section title="Oferta vinculada">
          {offer ? (
            <div className="grid gap-3 md:grid-cols-4">
              <Detail label="ID" value={get(offer, "ID", "id")} />
              <Detail label="Status" value={get(offer, "Status", "status")} />
              <Detail label="Valor inicial" value={money(get(offer, "InitialValue", "initial_value"))} />
              <Detail label="Valor atual" value={money(get(offer, "CurrentValue", "current_value"))} />
              <Detail label="Tipo" value={get(offer, "ServiceType", "service_type")} className="md:col-span-2" />
              <Detail label="Observacoes" value={get(offer, "Observations", "observations")} className="md:col-span-2" />
            </div>
          ) : (
            <EmptyState text="Nenhuma oferta carregada junto deste servico." />
          )}
        </Section>

        <Section title="Avaliacao">
          {review ? (
            <div className="grid gap-3 md:grid-cols-4">
              <Detail label="ID" value={get(review, "ID", "id")} />
              <Detail label="Cliente rating" value={get(review, "ClientRating", "client_rating")} />
              <Detail label="Diarista rating" value={get(review, "DiaristRating", "diarist_rating")} />
              <Detail label="Criada em" value={dateTime(get(review, "CreatedAt", "created_at"))} />
              <Detail label="Comentario cliente" value={get(review, "ClientComment", "client_comment")} className="md:col-span-2" />
              <Detail label="Comentario diarista" value={get(review, "DiaristComment", "diarist_comment")} className="md:col-span-2" />
            </div>
          ) : (
            <EmptyState text="Nenhuma avaliacao carregada para este servico." />
          )}
        </Section>
      </div>
    </Modal>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h4 className="text-sm font-black uppercase tracking-wide text-muted-foreground">{title}</h4>
      {children}
    </section>
  );
}

function UserPanel({ title, user }) {
  if (!user) return <EmptyState text={`${title} nao carregado pela API.`} />;
  const name = userValue(user, "Name");
  const email = userValue(user, "Email");
  const role = userValue(user, "Role");
  const phone = userValue(user, "Phone");
  const cpf = userValue(user, "Cpf");
  const photo = userValue(user, "Photo");
  return (
    <div className="rounded-xl border bg-slate-50 p-4 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-200 text-sm font-black dark:bg-white/10">
          {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : String(name || title).slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-black">{name || "-"}</p>
          <p className="truncate text-xs text-muted-foreground">{email || "Email nao enviado pela API"}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Detail label="ID" value={userValue(user, "ID")} />
        <Detail label="Role" value={role} />
        <Detail label="Telefone" value={phone} />
        {cpf !== undefined && <Detail label="CPF" value={cpf} />}
      </div>
    </div>
  );
}

function AddressPanel({ address }) {
  if (!address) return <EmptyState text="Endereco nao carregado pela API." />;
  const rooms = get(address, "Rooms", "rooms") || [];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <Detail label="Rua" value={addressValue(address, "Street")} className="md:col-span-2" />
        <Detail label="Numero" value={addressValue(address, "Number")} />
        <Detail label="Complemento" value={addressValue(address, "Complement")} />
        <Detail label="Bairro" value={addressValue(address, "Neighborhood")} />
        <Detail label="Cidade" value={addressValue(address, "City")} />
        <Detail label="Estado" value={addressValue(address, "State")} />
        <Detail label="CEP" value={addressValue(address, "Zipcode")} />
        <Detail label="Tipo residencia" value={addressValue(address, "ResidenceType")} />
        <Detail label="Referencia" value={addressValue(address, "ReferencePoint")} className="md:col-span-2" />
        <Detail label="Latitude" value={addressValue(address, "Latitude")} />
        <Detail label="Longitude" value={addressValue(address, "Longitude")} />
      </div>
      {Array.isArray(rooms) && rooms.length > 0 && (
        <div className="rounded-lg border p-3">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Comodos</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {rooms.map((room) => (
              <div key={get(room, "ID", "id") || `${get(room, "Name", "name")}`} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-white/[0.04]">
                <span>{get(room, "Name", "name")}</span>
                <strong>{get(room, "Quantity", "quantity")}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="rounded-lg border border-dashed bg-slate-50 p-4 text-sm text-muted-foreground dark:bg-white/[0.04]">{text}</div>;
}

function Detail({ label, value, className = "", tone = "default" }) {
  const tones = {
    default: "bg-slate-50 dark:bg-white/[0.04]",
    slate: "bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white",
    teal: "bg-teal-50 text-teal-950 ring-1 ring-teal-200/60 dark:bg-teal-500/10 dark:text-teal-100 dark:ring-teal-500/20",
    sky: "bg-sky-50 text-sky-950 ring-1 ring-sky-200/60 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/20",
    amber: "bg-amber-50 text-amber-950 ring-1 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/20",
  };
  return (
    <div className={`rounded-lg border p-4 ${tones[tone]} ${className}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-65">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{value === undefined || value === null || value === "" ? "-" : value}</p>
    </div>
  );
}
