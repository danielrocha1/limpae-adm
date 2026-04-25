import { userSchema, clientProfileSchema, diaristProfileSchema } from "../generated/modelSchema";

export const roleOptions = ["cliente", "diarista", "admin"];

export function getValue(record, fieldName) {
  if (!record) return undefined;
  const camel = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
  const snake = fieldName.replace(/[A-Z]/g, (letter, index) => `${index ? "_" : ""}${letter.toLowerCase()}`);
  return record[fieldName] ?? record[camel] ?? record[snake];
}

export function getUserId(user) {
  return getValue(user, "ID") ?? getValue(user, "Id") ?? getValue(user, "id");
}

export function getUserRole(user) {
  return String(getValue(user, "Role") || "").toLowerCase();
}

export function getUserName(user) {
  return getValue(user, "Name") || "Sem nome";
}

export function getUserEmail(user) {
  return getValue(user, "Email") || "-";
}

export function isUserInRole(user, role) {
  return role === "todos" || getUserRole(user) === role;
}

export function formatFieldValue(value, field) {
  if (value === undefined || value === null || value === "") return "-";
  if (field?.input === "checkbox") return value ? "Sim" : "Nao";
  if (field?.input === "datetime") return new Date(value).toLocaleString("pt-BR");
  if (field?.baseType === "float64") {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return String(value);
}

export function editableUserFields() {
  return (userSchema?.fields || []).filter((field) => field.editable);
}

export function tableUserFields() {
  const preferred = ["Name", "Email", "Cpf", "Phone", "Role", "EmailVerified", "CreatedAt"];
  const fields = (userSchema?.fields || []).filter((field) => field.table);
  return preferred.map((name) => fields.find((field) => field.name === name)).filter(Boolean);
}

export function profileSchemaForRole(role) {
  if (role === "diarista") return diaristProfileSchema;
  if (role === "cliente") return clientProfileSchema;
  return null;
}

export { userSchema, clientProfileSchema, diaristProfileSchema };
