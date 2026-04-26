import React, { useEffect, useState } from "react";
import { Home, Loader2, Plus, Trash2, User } from "lucide-react";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { useToast } from "./Toast";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { getUserId, getUserRole, getValue } from "../lib/schema";

const emptyPersonal = {
  name: "",
  photo: "",
  email: "",
  phone: "",
  cpf: "",
  is_test_user: false,
  email_verified: false,
};

const emptyAddress = {
  street: "",
  number: "",
  residence_type: "apartment",
  complement: "",
  neighborhood: "",
  reference_point: "",
  city: "",
  state: "",
  zipcode: "",
  latitude: "",
  longitude: "",
};

const emptyClientProfile = {
  residence_type: "apartment",
  desired_frequency: "",
  has_pets: false,
};

const emptyDiaristProfile = {
  bio: "",
  experience_years: 0,
  price_per_hour: 0,
  price_per_day: 0,
  specialties: "",
  available: true,
};

function pick(record, ...keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) return record[key];
  }
  return undefined;
}

function snakeValue(record, key) {
  const pascal = key.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  return pick(record, key, pascal);
}

function firstAddress(user) {
  const addresses = getValue(user, "Address");
  if (Array.isArray(addresses)) return addresses[0];
  return addresses || null;
}

function roomsOf(address) {
  const rooms = snakeValue(address, "rooms") || [];
  if (!Array.isArray(rooms) || rooms.length === 0) return [{ name: "", quantity: 1 }];
  return rooms.map((room) => ({
    name: snakeValue(room, "name") || "",
    quantity: Number(snakeValue(room, "quantity") || 1),
  }));
}

function toNumberOrZero(value) {
  if (value === "" || value === null || value === undefined) return 0;
  return Number(value) || 0;
}

export default function UserEditForm({ user, defaultRole = "cliente", onSuccess }) {
  const [personal, setPersonal] = useState(emptyPersonal);
  const [address, setAddress] = useState(emptyAddress);
  const [rooms, setRooms] = useState([{ name: "", quantity: 1 }]);
  const [clientProfile, setClientProfile] = useState(emptyClientProfile);
  const [diaristProfile, setDiaristProfile] = useState(emptyDiaristProfile);
  const updateMutation = useUpdateUser();
  const createMutation = useCreateUser();
  const { addToast } = useToast();
  const isEditing = Boolean(user);
  const role = getUserRole(user) || (defaultRole === "todos" ? "cliente" : defaultRole);
  const isSaving = updateMutation.isPending || createMutation.isPending;

  useEffect(() => {
    const userAddress = firstAddress(user);
    const profile = role === "diarista" ? getValue(user, "DiaristProfile") : getValue(user, "UserProfile");

    setPersonal({
      name: getValue(user, "Name") || "",
      photo: getValue(user, "Photo") || "",
      email: getValue(user, "Email") || "",
      phone: String(getValue(user, "Phone") || ""),
      cpf: getValue(user, "Cpf") || "",
      is_test_user: Boolean(getValue(user, "IsTestUser")),
      email_verified: Boolean(getValue(user, "EmailVerified")),
    });

    setAddress({
      street: snakeValue(userAddress, "street") || "",
      number: snakeValue(userAddress, "number") || "",
      residence_type: snakeValue(userAddress, "residence_type") || "apartment",
      complement: snakeValue(userAddress, "complement") || "",
      neighborhood: snakeValue(userAddress, "neighborhood") || "",
      reference_point: snakeValue(userAddress, "reference_point") || "",
      city: snakeValue(userAddress, "city") || "",
      state: snakeValue(userAddress, "state") || "",
      zipcode: snakeValue(userAddress, "zipcode") || "",
      latitude: snakeValue(userAddress, "latitude") || "",
      longitude: snakeValue(userAddress, "longitude") || "",
    });

    setRooms(roomsOf(userAddress));
    setClientProfile({
      residence_type: snakeValue(profile, "residence_type") || snakeValue(userAddress, "residence_type") || "apartment",
      desired_frequency: snakeValue(profile, "desired_frequency") || "",
      has_pets: Boolean(snakeValue(profile, "has_pets")),
    });
    setDiaristProfile({
      bio: snakeValue(profile, "bio") || "",
      experience_years: Number(snakeValue(profile, "experience_years") || 0),
      price_per_hour: Number(snakeValue(profile, "price_per_hour") || 0),
      price_per_day: Number(snakeValue(profile, "price_per_day") || 0),
      specialties: Array.isArray(snakeValue(profile, "specialties")) ? snakeValue(profile, "specialties").join(", ") : snakeValue(profile, "specialties") || "",
      available: snakeValue(profile, "available") === undefined ? true : Boolean(snakeValue(profile, "available")),
    });
  }, [role, user]);

  function updatePersonal(field, value) {
    setPersonal((current) => ({ ...current, [field]: value }));
  }

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function updateRoom(index, field, value) {
    setRooms((current) => current.map((room, roomIndex) => (roomIndex === index ? { ...room, [field]: value } : room)));
  }

  function addRoom() {
    setRooms((current) => [...current, { name: "", quantity: 1 }]);
  }

  function removeRoom(index) {
    setRooms((current) => current.filter((_, roomIndex) => roomIndex !== index));
  }

  function buildPayload() {
    const cleanRooms = rooms
      .filter((room) => String(room.name || "").trim())
      .map((room) => ({ name: String(room.name).trim(), quantity: Math.max(1, Number(room.quantity) || 1) }));

    const payload = {
      ...personal,
      photo: String(personal.photo || "").length <= 255 ? personal.photo : "",
      phone: String(personal.phone || "").replace(/\D/g, ""),
      address: {
        ...address,
        latitude: toNumberOrZero(address.latitude),
        longitude: toNumberOrZero(address.longitude),
        rooms: role === "diarista" ? [] : cleanRooms,
      },
    };

    if (role === "diarista") {
      payload.diarist_profile = {
        ...diaristProfile,
        experience_years: Number(diaristProfile.experience_years) || 0,
        price_per_hour: Number(diaristProfile.price_per_hour) || 0,
        price_per_day: Number(diaristProfile.price_per_day) || 0,
        specialties: String(diaristProfile.specialties || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };
    } else {
      payload.client_preferences = clientProfile;
    }

    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = buildPayload();

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: getUserId(user), data: payload });
        addToast("Cadastro atualizado com sucesso.", "success");
      } else {
        await createMutation.mutateAsync({ ...payload, role });
        addToast("Usuario criado com sucesso.", "success");
      }
      onSuccess?.();
    } catch (err) {
      const apiMessage = err?.response?.data?.error || err?.response?.data?.message;
      addToast(apiMessage || err.message || "Nao foi possivel salvar o cadastro.", "error");
    }
  }

  return (
    <form id="user-edit-form" onSubmit={handleSubmit} className="space-y-6">
      <Section title="Informações pessoais" icon={User}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-white/10">
            {personal.photo ? <img src={personal.photo} alt="" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-muted-foreground" />}
          </div>
          <div className="grid flex-1 gap-4 md:grid-cols-2">
            <Field label="Nome" value={personal.name} onChange={(value) => updatePersonal("name", value)} required />
            <Field label="Email" type="email" value={personal.email} onChange={(value) => updatePersonal("email", value)} required />
            <Field label="Telefone" value={personal.phone} onChange={(value) => updatePersonal("phone", value)} required />
            <Field label="CPF" value={personal.cpf} onChange={(value) => updatePersonal("cpf", value)} required />
            <Field label="URL da foto" value={personal.photo} onChange={(value) => updatePersonal("photo", value)} className="md:col-span-2" />
            <label className="hidden">
              <input type="checkbox" checked={personal.is_test_user} onChange={(event) => updatePersonal("is_test_user", event.target.checked)} />
              Usuário teste
            </label>
            <ToggleField
              label={role === "diarista" ? "Diarista teste" : "Usuario teste"}
              checked={personal.is_test_user}
              onChange={(checked) => updatePersonal("is_test_user", checked)}
            />
            <ToggleField
              label="Email verificado"
              checked={personal.email_verified}
              onChange={(checked) => updatePersonal("email_verified", checked)}
            />
          </div>
        </div>
      </Section>

      <Section title="Endereço de cadastro" icon={Home}>
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Rua" value={address.street} onChange={(value) => updateAddress("street", value)} required className="md:col-span-2" />
          <Field label="Número" value={address.number} onChange={(value) => updateAddress("number", value)} />
          <SelectField label="Tipo" value={address.residence_type} onChange={(value) => updateAddress("residence_type", value)} options={["apartment", "house", "office"]} />
          <Field label="Complemento" value={address.complement} onChange={(value) => updateAddress("complement", value)} />
          <Field label="Bairro" value={address.neighborhood} onChange={(value) => updateAddress("neighborhood", value)} required />
          <Field label="Cidade" value={address.city} onChange={(value) => updateAddress("city", value)} required />
          <Field label="Estado" value={address.state} onChange={(value) => updateAddress("state", value)} required />
          <Field label="CEP" value={address.zipcode} onChange={(value) => updateAddress("zipcode", value)} required />
          <Field label="Ponto de referência" value={address.reference_point} onChange={(value) => updateAddress("reference_point", value)} className="md:col-span-2" />
          <Field label="Latitude" type="number" value={address.latitude} onChange={(value) => updateAddress("latitude", value)} />
          <Field label="Longitude" type="number" value={address.longitude} onChange={(value) => updateAddress("longitude", value)} />
        </div>
      </Section>

      {role !== "diarista" && (
        <Section title="Cômodos">
          <div className="space-y-3">
            {rooms.map((room, index) => (
              <div key={index} className="grid gap-3 rounded-lg border bg-slate-50 p-3 dark:bg-white/[0.04] sm:grid-cols-[1fr_120px_auto]">
                <Field label="Cômodo" value={room.name} onChange={(value) => updateRoom(index, "name", value)} />
                <Field label="Quantidade" type="number" value={room.quantity} onChange={(value) => updateRoom(index, "quantity", value)} />
                <Button variant="outline" size="icon" className="self-end rounded-lg text-destructive hover:bg-destructive/10" onClick={() => removeRoom(index)} disabled={rooms.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="rounded-lg" onClick={addRoom}>
              <Plus className="h-4 w-4" />
              Adicionar cômodo
            </Button>
          </div>
        </Section>
      )}

      {role === "diarista" ? (
        <Section title="Perfil da diarista">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Bio" value={diaristProfile.bio} onChange={(value) => setDiaristProfile((current) => ({ ...current, bio: value }))} className="md:col-span-3" />
            <Field label="Experiência" type="number" value={diaristProfile.experience_years} onChange={(value) => setDiaristProfile((current) => ({ ...current, experience_years: value }))} />
            <Field label="Preço por hora" type="number" value={diaristProfile.price_per_hour} onChange={(value) => setDiaristProfile((current) => ({ ...current, price_per_hour: value }))} />
            <Field label="Preço por dia" type="number" value={diaristProfile.price_per_day} onChange={(value) => setDiaristProfile((current) => ({ ...current, price_per_day: value }))} />
            <Field label="Especialidades" value={diaristProfile.specialties} onChange={(value) => setDiaristProfile((current) => ({ ...current, specialties: value }))} className="md:col-span-2" />
            <label className="flex h-11 items-center gap-3 self-end rounded-lg border bg-slate-50 px-3 text-sm font-semibold dark:bg-white/[0.04]">
              <input type="checkbox" checked={diaristProfile.available} onChange={(event) => setDiaristProfile((current) => ({ ...current, available: event.target.checked }))} />
              Disponível
            </label>
          </div>
        </Section>
      ) : (
        <Section title="Preferências do contratante">
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField label="Tipo de residência" value={clientProfile.residence_type} onChange={(value) => setClientProfile((current) => ({ ...current, residence_type: value }))} options={["apartment", "house", "office"]} />
            <Field label="Frequência desejada" value={clientProfile.desired_frequency} onChange={(value) => setClientProfile((current) => ({ ...current, desired_frequency: value }))} />
            <label className="flex h-11 items-center gap-3 self-end rounded-lg border bg-slate-50 px-3 text-sm font-semibold dark:bg-white/[0.04]">
              <input type="checkbox" checked={clientProfile.has_pets} onChange={(event) => setClientProfile((current) => ({ ...current, has_pets: event.target.checked }))} />
              Tem pets
            </label>
          </div>
        </Section>
      )}

      <div className="flex justify-end gap-2 border-t pt-5">
        <Button className="h-11 rounded-lg bg-slate-950 px-5 text-white hover:bg-slate-800 dark:bg-teal-400 dark:text-slate-950" type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Salvar cadastro completo" : "Criar usuario"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-teal-500" />}
        <h3 className="text-sm font-black uppercase tracking-wide text-muted-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = false, className = "" }) {
  return (
    <label className={`space-y-2 text-sm font-semibold ${className}`}>
      <span>{label}</span>
      <Input
        className="h-11 rounded-lg"
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        step={type === "number" ? "any" : undefined}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="space-y-2 text-sm font-semibold">
      <span>{label}</span>
      <select
        className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex h-11 items-center justify-between gap-3 self-end rounded-lg border bg-slate-50 px-3 text-sm font-semibold dark:bg-white/[0.04]">
      <span>{label}</span>
      <button
        type="button"
        className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-teal-400" : "bg-slate-300 dark:bg-slate-700"}`}
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}
