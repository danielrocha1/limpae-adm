export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatPhone(value) {
  if (!value) return "-";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return String(value);
}

export function normalizeArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export function getStatusTone(status = "") {
  const normalized = String(status).toLowerCase();
  if (["active", "ativo", "aceita", "accepted", "concluido", "concluído", "paid", "premium", "basic"].includes(normalized)) return "success";
  if (["pendente", "pending", "aberta", "negociacao", "em andamento", "processing", "free"].includes(normalized)) return "warning";
  if (["cancelado", "cancelada", "canceled", "inactive", "recusada", "error"].includes(normalized)) return "danger";
  return "neutral";
}

export function sumBy(items, field) {
  return items.reduce((total, item) => total + Number(item?.[field] || 0), 0);
}

export function averageBy(items, field) {
  if (!items.length) return 0;
  return sumBy(items, field) / items.length;
}
