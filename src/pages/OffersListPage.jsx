import React, { useMemo, useState } from "react";
import { CalendarClock, HandCoins, MapPin, Search, UserRound } from "lucide-react";
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

function get(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) return object[key];
  }
  return undefined;
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
  return (
    <Modal isOpen={Boolean(offer)} onClose={onClose} title={`Oferta #${get(offer, "ID", "id") || ""}`}>
      <div className="grid gap-4 md:grid-cols-2">
        <Detail label="Status" value={get(offer, "Status", "status")} />
        <Detail label="Tipo de serviço" value={get(offer, "ServiceType", "service_type")} />
        <Detail label="Cliente" value={client?.Name || client?.name || "Cliente nao informado"} />
        <Detail label="Data" value={dateTime(get(offer, "ScheduledAt", "scheduled_at"))} />
        <Detail label="Valor inicial" value={money(get(offer, "InitialValue", "initial_value"))} />
        <Detail label="Valor atual" value={money(get(offer, "CurrentValue", "current_value"))} />
        <Detail label="Endereço" value={address?.street || address?.Street || "Endereco nao informado"} className="md:col-span-2" />
        <Detail label="Observações" value={get(offer, "Observations", "observations") || "-"} className="md:col-span-2" />
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
