import React, { useEffect, useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, MapPin, Search, UserRound } from "lucide-react";
import { useOffers } from "../hooks/useOffers";
import Modal from "../components/Modal";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Skeleton } from "../components/ui/Skeleton";

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function yesNo(value) {
  return value ? "Sim" : "Nao";
}

function get(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) return object[key];
  }
  return undefined;
}

function userValue(user, key) {
  return get(user, key, key?.toLowerCase?.());
}

function addressValue(address, key) {
  return get(address, key, key?.toLowerCase?.());
}

const pageSize = 9;
const allStatusFilter = "todas";

function normalizeStatus(value) {
  return String(value || "sem status").trim().toLowerCase();
}

export default function OffersListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [statusFilter, setStatusFilter] = useState(allStatusFilter);
  const { data: offerPage, isLoading } = useOffers({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
  });
  const offers = offerPage?.items || [];
  const pagination = offerPage?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? Math.ceil(offers.length / pageSize));
  const statusOptions = useMemo(() => {
    const counts = offers.reduce((accumulator, offer) => {
      const status = normalizeStatus(get(offer, "Status", "status"));
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    }, {});

    return [
      { value: allStatusFilter, label: "Todas", count: offers.length },
      ...Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
        .map(([value, count]) => ({ value, label: value, count })),
    ];
  }, [offers]);
  const visibleOffers = offers.filter((offer) => statusFilter === allStatusFilter || normalizeStatus(get(offer, "Status", "status")) === statusFilter);

  useEffect(() => {
    if (pagination?.page && pagination.page !== page) {
      setPage(pagination.page);
    }
  }, [page, pagination?.page]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-white/[0.04] dark:ring-white/10">
        <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">Mural operacional</Badge>
        <h1 className="mt-4 text-4xl font-black tracking-normal">Ofertas</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Acompanhe ofertas abertas, negociacoes e valores publicados pelos clientes.
        </p>
      </section>

      <Card className="border-0 bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-11 rounded-lg pl-10"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar por cliente, tipo de servico ou status"
            />
          </div>

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
        {visibleOffers.map((offer) => {
          const id = get(offer, "ID", "id");
          const status = get(offer, "Status", "status") || "sem status";
          const client = get(offer, "Client", "client");
          const address = get(offer, "Address", "address");
          return (
            <Card key={id} className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
              <div className="flex items-center justify-between border-b bg-slate-50 p-4 dark:bg-white/[0.04]">
                <Badge className={status === "aberta" ? "bg-teal-500/10 text-teal-700 dark:text-teal-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}>
                  {status}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">#{id}</span>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tipo de servico</p>
                  <h2 className="mt-1 text-lg font-black">{get(offer, "ServiceType", "service_type") || "-"}</h2>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-teal-500" />
                    <span className="truncate">{client?.Name || client?.name || "Cliente nao informado"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarClock className="h-4 w-4 text-teal-500" />
                    <span>{dateTime(get(offer, "ScheduledAt", "scheduled_at"))}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-teal-500" />
                    <span className="truncate">{address?.street || address?.Street || "Endereco nao informado"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t pt-4">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.04]">
                    <p className="text-xs text-muted-foreground">Inicial</p>
                    <p className="mt-1 font-bold">{money(get(offer, "InitialValue", "initial_value"))}</p>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-3 text-white">
                    <p className="text-xs text-slate-300">Atual</p>
                    <p className="mt-1 font-bold">{money(get(offer, "CurrentValue", "current_value"))}</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-lg text-xs font-black" onClick={() => setSelectedOffer(offer)}>
                  Ver detalhes
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={visibleOffers.length}
        itemLabel="ofertas"
        helperText={statusFilter === allStatusFilter ? "Filtradas pela busca e pela pagina atual" : `Status ativo: ${statusFilter}`}
        onPrevious={() => setPage((value) => Math.max(1, value - 1))}
        onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
      />

      {visibleOffers.length === 0 && (
        <div className="rounded-xl border border-dashed bg-white py-16 text-center text-muted-foreground dark:bg-white/[0.04]">
          Nenhuma oferta encontrada com esse filtro.
        </div>
      )}

      <OfferDetailsModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
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
            Exibindo {totalItems} {itemLabel} filtradas
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

function OfferDetailsModal({ offer, onClose }) {
  if (!offer) return null;
  const client = get(offer, "Client", "client");
  const address = get(offer, "Address", "address");
  const acceptedByDiarist = get(offer, "AcceptedByDiarist", "accepted_by_diarist");
  const negotiations = get(offer, "Negotiations", "negotiations") || [];
  return (
    <Modal isOpen={Boolean(offer)} onClose={onClose} title={`Oferta #${get(offer, "ID", "id") || ""}`}>
      <div className="space-y-6">
        <Section title="Resumo da oferta">
          <div className="grid gap-3 md:grid-cols-4">
            <Detail label="ID" value={get(offer, "ID", "id")} />
            <Detail label="Status" value={get(offer, "Status", "status")} />
            <Detail label="Tipo de servico" value={get(offer, "ServiceType", "service_type")} className="md:col-span-2" />
            <Detail label="Agendada para" value={dateTime(get(offer, "ScheduledAt", "scheduled_at"))} />
            <Detail label="Duracao" value={`${get(offer, "DurationHours", "duration_hours") || "-"}h`} />
            <Detail label="Criada em" value={dateTime(get(offer, "CreatedAt", "created_at"))} />
            <Detail label="Atualizada em" value={dateTime(get(offer, "UpdatedAt", "updated_at"))} />
          </div>
        </Section>

        <Section title="Valores e vinculos">
          <div className="grid gap-3 md:grid-cols-4">
            <Detail label="Valor inicial" value={money(get(offer, "InitialValue", "initial_value"))} />
            <Detail label="Valor atual" value={money(get(offer, "CurrentValue", "current_value"))} />
            <Detail label="ClientID" value={get(offer, "ClientID", "client_id")} />
            <Detail label="AddressID" value={get(offer, "AddressID", "address_id")} />
            <Detail label="AcceptedByDiaristID" value={get(offer, "AcceptedByDiaristID", "accepted_by_diarist_id")} />
          </div>
        </Section>

        <Section title="Textos operacionais">
          <div className="grid gap-3 md:grid-cols-2">
            <Detail label="Observacoes" value={get(offer, "Observations", "observations")} />
            <Detail label="Motivo de cancelamento" value={get(offer, "CancelReason", "cancel_reason")} />
          </div>
        </Section>

        <Section title="Pessoas vinculadas">
          <div className="grid gap-4 md:grid-cols-2">
            <UserPanel title="Cliente" user={client} />
            <UserPanel title="Diarista aceita" user={acceptedByDiarist} />
          </div>
        </Section>

        <Section title="Endereco">
          <AddressPanel address={address} />
        </Section>

        <Section title={`Negociacoes (${Array.isArray(negotiations) ? negotiations.length : 0})`}>
          {Array.isArray(negotiations) && negotiations.length > 0 ? (
            <div className="space-y-3">
              {negotiations.map((negotiation) => (
                <NegotiationPanel key={get(negotiation, "ID", "id")} negotiation={negotiation} />
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhuma negociacao carregada para esta oferta." />
          )}
        </Section>
      </div>
    </Modal>
  );
}

function NegotiationPanel({ negotiation }) {
  const diarist = get(negotiation, "Diarist", "diarist");
  return (
    <div className="rounded-xl border p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <Detail label="ID" value={get(negotiation, "ID", "id")} />
        <Detail label="Status" value={get(negotiation, "Status", "status")} />
        <Detail label="Contraproposta" value={money(get(negotiation, "CounterValue", "counter_value"))} />
        <Detail label="Duracao" value={`${get(negotiation, "CounterDurationHours", "counter_duration_hours") || "-"}h`} />
        <Detail label="Distancia diarista" value={get(negotiation, "DiaristDistance", "diarist_distance")} />
        <Detail label="Rating diarista" value={get(negotiation, "DiaristRating", "diarist_rating")} />
        <Detail label="Criada em" value={dateTime(get(negotiation, "CreatedAt", "created_at"))} />
        <Detail label="Atualizada em" value={dateTime(get(negotiation, "UpdatedAt", "updated_at"))} />
        <Detail label="Mensagem" value={get(negotiation, "Message", "message")} className="md:col-span-2" />
        <Detail label="Motivo de recusa" value={get(negotiation, "RejectionReason", "rejection_reason")} className="md:col-span-2" />
      </div>
      <div className="mt-4">
        <UserPanel title="Diarista da negociacao" user={diarist} />
      </div>
    </div>
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
  return (
    <div className="rounded-xl border bg-slate-50 p-4 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-200 text-sm font-black dark:bg-white/10">
          {userValue(user, "Photo") ? <img src={userValue(user, "Photo")} alt="" className="h-full w-full object-cover" /> : String(userValue(user, "Name") || title).slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-black">{userValue(user, "Name") || "-"}</p>
          <p className="truncate text-xs text-muted-foreground">{userValue(user, "Email") || "-"}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Detail label="ID" value={userValue(user, "ID")} />
        <Detail label="Role" value={userValue(user, "Role")} />
        <Detail label="Telefone" value={userValue(user, "Phone")} />
        <Detail label="CPF" value={userValue(user, "Cpf")} />
        <Detail label="Email verificado" value={yesNo(userValue(user, "EmailVerified"))} />
        <Detail label="Usuario teste" value={yesNo(userValue(user, "IsTestUser"))} />
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

function Detail({ label, value, className = "" }) {
  return (
    <div className={`rounded-lg border bg-slate-50 p-4 dark:bg-white/[0.04] ${className}`}>
      <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{value === undefined || value === null || value === "" ? "-" : value}</p>
    </div>
  );
}
