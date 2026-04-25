import React, { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, UserRound, Users } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { getUserEmail, getUserName, getUserRole, getValue } from "../lib/schema";

const fallbackCenter = [-22.9068, -43.1729];

function pick(record, ...keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) return record[key];
  }
  return undefined;
}

function addressValue(address, key) {
  const snake = key.replace(/[A-Z]/g, (letter, index) => `${index ? "_" : ""}${letter.toLowerCase()}`);
  return pick(address, key, key.charAt(0).toLowerCase() + key.slice(1), snake);
}

function addressesOf(user) {
  const addresses = getValue(user, "Address");
  if (Array.isArray(addresses)) return addresses;
  return addresses ? [addresses] : [];
}

function addressLine(address) {
  const street = addressValue(address, "Street");
  const number = addressValue(address, "Number");
  const neighborhood = addressValue(address, "Neighborhood");
  const city = addressValue(address, "City");
  const state = addressValue(address, "State");
  return [street && number ? `${street}, ${number}` : street, neighborhood, city && state ? `${city}/${state}` : city || state]
    .filter(Boolean)
    .join(" - ") || "Endereço sem descrição";
}

function coordinate(address, key) {
  const value = Number(addressValue(address, key));
  return Number.isFinite(value) && value !== 0 ? value : null;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pinIcon(user, role) {
  const color = role === "diarista" ? "#14b8a6" : role === "cliente" ? "#38bdf8" : "#f59e0b";
  const photo = getValue(user, "Photo");
  const initials = getUserName(user).slice(0, 2).toUpperCase();
  const avatar = photo
    ? `<img src="${escapeHtml(photo)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:999px;" />`
    : `<span style="display:grid;place-items:center;width:100%;height:100%;font:800 15px Inter,Arial,sans-serif;color:#0f172a;background:#e2e8f0;border-radius:999px;">${escapeHtml(initials)}</span>`;

  return L.divIcon({
    className: "",
    html: `<div style="
      position:relative;
      width:54px;
      height:62px;
      transform:translateY(-4px);
    ">
      <div style="
        position:absolute;
        left:50%;
        bottom:2px;
        width:18px;
        height:18px;
        background:${color};
        border:3px solid #fff;
        border-radius:4px;
        transform:translateX(-50%) rotate(45deg);
        box-shadow:0 14px 28px rgba(15,23,42,.35);
      "></div>
      <div style="
        position:absolute;
        inset:0 0 auto 0;
        width:54px;
        height:54px;
        overflow:hidden;
        border-radius:999px;
        background:#fff;
        border:4px solid ${color};
        box-shadow:0 16px 32px rgba(15,23,42,.35), 0 0 0 4px rgba(255,255,255,.92);
      ">
        ${avatar}
      </div>
    </div>`,
    iconSize: [54, 62],
    iconAnchor: [27, 62],
    popupAnchor: [0, -58],
  });
}

export default function MapPage() {
  const { data: users = [], isLoading } = useUsers();

  const pins = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.flatMap((user) => {
      const role = getUserRole(user);
      return addressesOf(user)
        .map((address) => {
          const lat = coordinate(address, "Latitude");
          const lng = coordinate(address, "Longitude");
          if (lat === null || lng === null) return null;
          return {
            id: `${getValue(user, "ID") || getValue(user, "id")}-${addressValue(address, "ID") || addressValue(address, "id") || `${lat}-${lng}`}`,
            user,
            role,
            lat,
            lng,
            address,
          };
        })
        .filter(Boolean);
    });
  }, [users]);

  const center = pins.length ? [pins[0].lat, pins[0].lng] : fallbackCenter;
  const clientPins = pins.filter((pin) => pin.role === "cliente").length;
  const diaristPins = pins.filter((pin) => pin.role === "diarista").length;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-[620px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-white/[0.04] dark:ring-white/10">
        <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950">Geolocalização</Badge>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-normal">Mapa de usuários</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pins gerados a partir da latitude e longitude dos endereços cadastrados.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric icon={MapPin} label="Pins" value={pins.length} />
            <Metric icon={UserRound} label="Clientes" value={clientPins} tone="sky" />
            <Metric icon={Users} label="Diaristas" value={diaristPins} tone="teal" />
          </div>
        </div>
      </section>

      <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.04] dark:ring-white/10">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Navigation className="h-4 w-4 text-teal-500" />
            {pins.length ? "Localizações encontradas" : "Nenhuma coordenada encontrada"}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Legend color="bg-sky-400" label="Cliente" />
            <Legend color="bg-teal-500" label="Diarista" />
            <Legend color="bg-amber-500" label="Outros" />
          </div>
        </div>

        <div className="h-[620px] w-full">
          <MapContainer center={center} zoom={pins.length ? 12 : 10} className="h-full w-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pins.map((pin) => (
              <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={pinIcon(pin.user, pin.role)}>
                <Popup>
                  <div className="min-w-[220px] space-y-2">
                    <div>
                      <p className="font-bold text-slate-950">{getUserName(pin.user)}</p>
                      <p className="text-xs text-slate-500">{getUserEmail(pin.user)}</p>
                    </div>
                    <div className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold uppercase text-slate-700">
                      {pin.role || "sem role"}
                    </div>
                    <p className="text-sm text-slate-700">{addressLine(pin.address)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-950 dark:bg-white/[0.04] dark:text-white",
    sky: "bg-sky-50 text-sky-950 dark:bg-sky-500/10 dark:text-sky-100",
    teal: "bg-teal-50 text-teal-950 dark:bg-teal-500/10 dark:text-teal-100",
  };
  return (
    <div className={`min-w-[120px] rounded-lg border p-3 ${tones[tone]}`}>
      <Icon className="h-4 w-4 opacity-70" />
      <p className="mt-2 text-xs font-semibold opacity-70">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 font-semibold text-muted-foreground">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
