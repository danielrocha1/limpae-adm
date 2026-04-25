import React, { useMemo, useState } from "react";
import { CalendarClock, MapPin, Search, UserRound } from "lucide-react";
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

export default function OffersListPage() {
  const { data: offers = [], isLoading } = useOffers();
  const [search, setSearch] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);

  const filteredOffers = useMemo(() => {
    const term = search.toLowerCase();
    return Array.isArray(offers)
      ? offers.filter((offer) => {
          const clientName = get(offer, "Client", "client")?.Name || get(offer, "Client", "client")?.name || "";
          const serviceType = get(offer, "ServiceType", "service_type") || "";
          const status = get(offer, "Status", "status") || "";
          return [clientName, serviceType, status].join(" ").toLowerCase().includes(term);
        })
      : [];
  }, [offers, search]);

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
          Acompanhe ofertas abertas, negociações e valores publicados pelos clientes.
        </p>
      </section>

      <Card className="border-0 bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-lg pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cliente, tipo de serviço ou status"
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredOffers.map((offer) => {
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
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tipo de serviço</p>
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

      {filteredOffers.length === 0 && (
        <div className="rounded-xl border border-dashed bg-white py-16 text-center text-muted-foreground dark:bg-white/[0.04]">
          Nenhuma oferta encontrada.
        </div>
      )}

      <OfferDetailsModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
    </div>
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
            <Detail label="Tipo de serviço" value={get(offer, "ServiceType", "service_type")} className="md:col-span-2" />
            <Detail label="Agendada para" value={dateTime(get(offer, "ScheduledAt", "scheduled_at"))} />
            <Detail label="Duração" value={`${get(offer, "DurationHours", "duration_hours") || "-"}h`} />
            <Detail label="Criada em" value={dateTime(get(offer, "CreatedAt", "created_at"))} />
            <Detail label="Atualizada em" value={dateTime(get(offer, "UpdatedAt", "updated_at"))} />
          </div>
        </Section>

        <Section title="Valores e vínculos">
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
            <Detail label="Observações" value={get(offer, "Observations", "observations")} />
            <Detail label="Motivo de cancelamento" value={get(offer, "CancelReason", "cancel_reason")} />
          </div>
        </Section>

        <Section title="Pessoas vinculadas">
          <div className="grid gap-4 md:grid-cols-2">
            <UserPanel title="Cliente" user={client} />
            <UserPanel title="Diarista aceita" user={acceptedByDiarist} />
          </div>
        </Section>

        <Section title="Endereço">
          <AddressPanel address={address} />
        </Section>

        <Section title={`Negociações (${Array.isArray(negotiations) ? negotiations.length : 0})`}>
          {Array.isArray(negotiations) && negotiations.length > 0 ? (
            <div className="space-y-3">
              {negotiations.map((negotiation) => (
                <NegotiationPanel key={get(negotiation, "ID", "id")} negotiation={negotiation} />
              ))}
            </div>
          ) : (
            <EmptyState text="Nenhuma negociação carregada para esta oferta." />
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
        <Detail label="Duração" value={`${get(negotiation, "CounterDurationHours", "counter_duration_hours") || "-"}h`} />
        <Detail label="Distância diarista" value={get(negotiation, "DiaristDistance", "diarist_distance")} />
        <Detail label="Rating diarista" value={get(negotiation, "DiaristRating", "diarist_rating")} />
        <Detail label="Criada em" value={dateTime(get(negotiation, "CreatedAt", "created_at"))} />
        <Detail label="Atualizada em" value={dateTime(get(negotiation, "UpdatedAt", "updated_at"))} />
        <Detail label="Mensagem" value={get(negotiation, "Message", "message")} className="md:col-span-2" />
        <Detail label="Motivo de recusa" value={get(negotiation, "RejectionReason", "rejection_reason")} className="md:col-span-2" />
      </div>
      <div className="mt-4">
        <UserPanel title="Diarista da negociação" user={diarist} />
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
  if (!user) return <EmptyState text={`${title} não carregado pela API.`} />;
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
        <Detail label="Usuário teste" value={yesNo(userValue(user, "IsTestUser"))} />
      </div>
    </div>
  );
}

function AddressPanel({ address }) {
  if (!address) return <EmptyState text="Endereço não carregado pela API." />;
  const rooms = get(address, "Rooms", "rooms") || [];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <Detail label="Rua" value={addressValue(address, "Street")} className="md:col-span-2" />
        <Detail label="Número" value={addressValue(address, "Number")} />
        <Detail label="Complemento" value={addressValue(address, "Complement")} />
        <Detail label="Bairro" value={addressValue(address, "Neighborhood")} />
        <Detail label="Cidade" value={addressValue(address, "City")} />
        <Detail label="Estado" value={addressValue(address, "State")} />
        <Detail label="CEP" value={addressValue(address, "Zipcode")} />
        <Detail label="Tipo residência" value={addressValue(address, "ResidenceType")} />
        <Detail label="Referência" value={addressValue(address, "ReferencePoint")} className="md:col-span-2" />
        <Detail label="Latitude" value={addressValue(address, "Latitude")} />
        <Detail label="Longitude" value={addressValue(address, "Longitude")} />
      </div>
      {Array.isArray(rooms) && rooms.length > 0 && (
        <div className="rounded-lg border p-3">
          <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cômodos</p>
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
