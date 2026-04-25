import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useServices } from "../hooks/useServices";
import { useUser } from "../hooks/useUsers";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import {
  formatFieldValue,
  getUserEmail,
  getUserName,
  getUserRole,
  getValue,
} from "../lib/schema";
import { formatCurrency, formatDate, formatPhone } from "../lib/formatters";

function pick(record, ...keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) return record[key];
  }
  return undefined;
}

function normalizeId(value) {
  return value === undefined || value === null ? "" : String(value);
}

function userId(user) {
  return normalizeId(getValue(user, "ID") ?? getValue(user, "Id") ?? pick(user, "id"));
}

function serviceUserId(service, role) {
  if (role === "diarista") {
    return normalizeId(pick(service, "DiaristID", "diarist_id") ?? pick(pick(service, "Diarist", "diarist"), "ID", "id"));
  }
  return normalizeId(pick(service, "ClientID", "client_id") ?? pick(pick(service, "Client", "client"), "ID", "id"));
}

function serviceStatus(service) {
  return String(pick(service, "Status", "status") || "sem status").toLowerCase();
}

function addressValue(address, key) {
  const snake = key.replace(/[A-Z]/g, (letter, index) => `${index ? "_" : ""}${letter.toLowerCase()}`);
  return pick(address, key, key.charAt(0).toLowerCase() + key.slice(1), snake);
}

function profileValue(profile, key) {
  const snake = key.replace(/[A-Z]/g, (letter, index) => `${index ? "_" : ""}${letter.toLowerCase()}`);
  return pick(profile, key, key.charAt(0).toLowerCase() + key.slice(1), snake);
}

function firstAddress(user) {
  const addresses = getValue(user, "Address");
  if (Array.isArray(addresses)) return addresses[0];
  return addresses;
}

function addressLine(address) {
  if (!address) return "-";
  const street = addressValue(address, "Street");
  const number = addressValue(address, "Number");
  const neighborhood = addressValue(address, "Neighborhood");
  const city = addressValue(address, "City");
  const state = addressValue(address, "State");
  return [street && number ? `${street}, ${number}` : street, neighborhood, city && state ? `${city}/${state}` : city || state]
    .filter(Boolean)
    .join(" - ") || "-";
}

function statusLabel(status) {
  const labels = {
    concluido: "Concluído",
    "concluído": "Concluído",
    cancelado: "Cancelado",
    pendente: "Pendente",
    aceito: "Aceito",
    "em servico": "Em serviço",
    "em serviço": "Em serviço",
    "em jornada": "Em jornada",
  };
  return labels[status] || status || "-";
}

export default function UserDetailPage() {
  const { id } = useParams();
  const { data: user, isLoading, isError } = useUser(id);
  const { data: services = [], isLoading: servicesLoading } = useServices();

  const role = getUserRole(user);
  const selectedUserId = userId(user);
  const relatedServices = useMemo(() => {
    if (!selectedUserId || !Array.isArray(services)) return [];
    return services
      .filter((service) => serviceUserId(service, role) === selectedUserId)
      .sort((a, b) => new Date(pick(b, "ScheduledAt", "scheduled_at", "CreatedAt", "created_at") || 0) - new Date(pick(a, "ScheduledAt", "scheduled_at", "CreatedAt", "created_at") || 0));
  }, [services, selectedUserId, role]);

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-12 w-40" /><Skeleton className="h-[560px] w-full" /></div>;
  }

  if (isError || !user) {
    return (
      <div className="space-y-6">
        <BackLink to="/clientes" />
        <Card className="border-0 bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
          <h1 className="text-2xl font-black">Usuário não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Não encontramos esse usuário na listagem carregada pela API.
          </p>
        </Card>
      </div>
    );
  }

  const address = firstAddress(user);
  const profile = role === "diarista" ? getValue(user, "DiaristProfile") : getValue(user, "UserProfile");
  const verified = Boolean(getValue(user, "EmailVerified"));
  const finishedCount = relatedServices.filter((service) => ["concluido", "concluído"].includes(serviceStatus(service))).length;
  const canceledCount = relatedServices.filter((service) => serviceStatus(service) === "cancelado").length;
  const totalSpent = relatedServices.reduce((total, service) => total + Number(pick(service, "TotalPrice", "total_price") || 0), 0);
  const lastService = relatedServices[0];

  return (
    <div className="space-y-6">
      <BackLink to={role === "diarista" ? "/diaristas" : "/clientes"} />

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-white/10 text-2xl font-black ring-1 ring-white/20">
                {getValue(user, "Photo") ? (
                  <img src={getValue(user, "Photo")} alt="" className="h-full w-full object-cover" />
                ) : (
                  getUserName(user).slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-teal-400/15 text-teal-200">{role || "sem role"}</Badge>
                  <Badge className={verified ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}>
                    {verified ? "Email verificado" : "Email pendente"}
                  </Badge>
                </div>
                <h1 className="mt-3 text-3xl font-black">{getUserName(user)}</h1>
                <p className="mt-1 text-sm text-slate-300">{getUserEmail(user)}</p>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-xs text-slate-400">ID do usuário</p>
              <p className="font-mono text-lg font-bold">#{selectedUserId || id}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 md:grid-cols-4">
          <TopFact icon={Mail} label="Email" value={getUserEmail(user)} />
          <TopFact icon={Phone} label="Telefone" value={formatPhone(getValue(user, "Phone"))} />
          <TopFact icon={IdCard} label="CPF" value={formatFieldValue(getValue(user, "Cpf"))} />
          <TopFact icon={Calendar} label="Criado em" value={formatDate(getValue(user, "CreatedAt"))} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={ReceiptText} label="Serviços vinculados" value={servicesLoading ? "..." : relatedServices.length} tone="slate" />
        <Metric icon={CheckCircle2} label="Concluídos" value={servicesLoading ? "..." : finishedCount} tone="teal" />
        <Metric icon={Clock} label="Cancelados" value={servicesLoading ? "..." : canceledCount} tone="amber" />
        <Metric icon={Wallet} label={role === "diarista" ? "Valor gerado" : "Total em serviços"} value={servicesLoading ? "..." : formatCurrency(totalSpent)} tone="sky" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <InfoSection title="Endereço principal" icon={MapPin}>
            <div className="rounded-xl border bg-slate-50 p-4 dark:bg-white/[0.04]">
              <p className="text-base font-black">{addressLine(address)}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Detail label="Rua" value={addressValue(address, "Street")} />
                <Detail label="Número" value={addressValue(address, "Number")} />
                <Detail label="Complemento" value={addressValue(address, "Complement")} />
                <Detail label="Bairro" value={addressValue(address, "Neighborhood")} />
                <Detail label="Cidade" value={addressValue(address, "City")} />
                <Detail label="Estado" value={addressValue(address, "State")} />
                <Detail label="CEP" value={addressValue(address, "Zipcode")} />
                <Detail label="Tipo de residência" value={addressValue(address, "ResidenceType")} />
                <Detail label="Ponto de referência" value={addressValue(address, "ReferencePoint")} />
              </div>
              <Rooms address={address} />
            </div>
          </InfoSection>

          <InfoSection title={role === "diarista" ? "Perfil da diarista" : "Preferências do cliente"} icon={Sparkles}>
            {profile ? (
              <div className="grid gap-3 md:grid-cols-3">
                {role === "diarista" ? (
                  <>
                    <Detail label="Bio" value={profileValue(profile, "Bio")} className="md:col-span-3" />
                    <Detail label="Experiência" value={`${profileValue(profile, "ExperienceYears") || 0} anos`} />
                    <Detail label="Preço por hora" value={formatCurrency(profileValue(profile, "PricePerHour"))} />
                    <Detail label="Preço por dia" value={formatCurrency(profileValue(profile, "PricePerDay"))} />
                    <Detail label="Especialidades" value={Array.isArray(profileValue(profile, "Specialties")) ? profileValue(profile, "Specialties").join(", ") : profileValue(profile, "Specialties")} className="md:col-span-2" />
                    <Detail label="Disponível" value={profileValue(profile, "Available") ? "Sim" : "Não"} />
                  </>
                ) : (
                  <>
                    <Detail label="Tipo de residência" value={profileValue(profile, "ResidenceType")} />
                    <Detail label="Frequência desejada" value={profileValue(profile, "DesiredFrequency")} />
                    <Detail label="Tem pets" value={profileValue(profile, "HasPets") ? "Sim" : "Não"} />
                  </>
                )}
              </div>
            ) : (
              <EmptyState text="A API não enviou perfil complementar para este usuário." />
            )}
          </InfoSection>
        </div>

        <div className="space-y-6">
          <InfoSection title="Atividade" icon={ShieldCheck}>
            <div className="space-y-3">
              <Detail label="Último serviço" value={lastService ? `#${pick(lastService, "ID", "id")} - ${statusLabel(serviceStatus(lastService))}` : "-"} tone="sky" />
              <Detail label="Data do último serviço" value={lastService ? formatDate(pick(lastService, "ScheduledAt", "scheduled_at", "CreatedAt", "created_at")) : "-"} />
              <Detail label="Email verificado" value={verified ? "Sim" : "Pendente"} tone={verified ? "teal" : "amber"} />
              <Detail label="Usuário teste" value={getValue(user, "IsTestUser") ? "Sim" : "Não"} />
            </div>
          </InfoSection>

          <InfoSection title="Histórico recente" icon={ReceiptText}>
            {servicesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : relatedServices.length ? (
              <div className="space-y-3">
                {relatedServices.slice(0, 5).map((service) => (
                  <div key={pick(service, "ID", "id")} className="rounded-lg border bg-slate-50 p-3 dark:bg-white/[0.04]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-sm font-black">#{pick(service, "ID", "id")}</p>
                      <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">{statusLabel(serviceStatus(service))}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{formatDate(pick(service, "ScheduledAt", "scheduled_at", "CreatedAt", "created_at"))}</p>
                    <p className="mt-1 text-sm font-bold">{formatCurrency(pick(service, "TotalPrice", "total_price"))}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="Nenhum serviço vinculado foi retornado pela API." />
            )}
          </InfoSection>
        </div>
      </div>
    </div>
  );
}

function BackLink({ to }) {
  return (
    <Link
      to={to}
      className="inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar
    </Link>
  );
}

function TopFact({ icon: Icon, label, value }) {
  return (
    <div className="border-b p-5 md:border-b-0 md:border-r md:last:border-r-0">
      <Icon className="mb-3 h-4 w-4 text-teal-500" />
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value || "-"}</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  const tones = {
    slate: "bg-slate-50 text-slate-950 dark:bg-white/[0.04] dark:text-white",
    teal: "bg-teal-50 text-teal-950 dark:bg-teal-500/10 dark:text-teal-100",
    amber: "bg-amber-50 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100",
    sky: "bg-sky-50 text-sky-950 dark:bg-sky-500/10 dark:text-sky-100",
  };
  return (
    <Card className={`border-0 p-5 shadow-sm ring-1 ring-slate-200/70 dark:ring-white/10 ${tones[tone]}`}>
      <Icon className="h-5 w-5 opacity-70" />
      <p className="mt-4 text-sm font-semibold opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </Card>
  );
}

function InfoSection({ title, icon: Icon, children }) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
      <div className="flex items-center gap-3 border-b p-5">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-500/10 text-teal-600">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-black">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function Detail({ label, value, className = "", tone = "default" }) {
  const tones = {
    default: "bg-white dark:bg-white/[0.03]",
    teal: "bg-teal-50 text-teal-950 ring-1 ring-teal-200/60 dark:bg-teal-500/10 dark:text-teal-100 dark:ring-teal-500/20",
    amber: "bg-amber-50 text-amber-950 ring-1 ring-amber-200/60 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/20",
    sky: "bg-sky-50 text-sky-950 ring-1 ring-sky-200/60 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/20",
  };
  return (
    <div className={`rounded-lg border p-4 ${tones[tone]} ${className}`}>
      <p className="text-xs font-black uppercase tracking-wide opacity-65">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold">{value === undefined || value === null || value === "" ? "-" : value}</p>
    </div>
  );
}

function Rooms({ address }) {
  const rooms = addressValue(address, "Rooms") || [];
  if (!Array.isArray(rooms) || rooms.length === 0) return null;
  return (
    <div className="mt-4 rounded-lg border bg-white p-4 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2">
        <Home className="h-4 w-4 text-teal-500" />
        <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Cômodos</p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rooms.map((room) => (
          <div key={pick(room, "ID", "id") || pick(room, "Name", "name")} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-white/[0.04]">
            <span>{pick(room, "Name", "name") || "-"}</span>
            <strong>{pick(room, "Quantity", "quantity") ?? "-"}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="rounded-lg border border-dashed bg-slate-50 p-4 text-sm text-muted-foreground dark:bg-white/[0.04]">{text}</div>;
}
