import { formatCurrency, formatDate, formatPhone } from "./lib/formatters";
import {
  normalizeOffers,
  normalizePayments,
  normalizeReviews,
  normalizeServices,
  normalizeSubscriptions,
  normalizeUsers,
} from "./lib/normalizers";

async function hydrateUserPayload(payload, { requestJson, token }) {
  const baseUsers = normalizeUsers(payload);

  const detailedUsers = await Promise.all(
    baseUsers.map(async (user) => {
      try {
        const detail = await requestJson(`/users/${user.id}`, { token });
        return detail;
      } catch (error) {
        return user;
      }
    })
  );

  return detailedUsers;
}

const reviewAverage = (item) => {
  const value = Number(item?.average_rating || 0);
  return value ? value.toFixed(1) : "-";
};

export const auditFindings = [
  {
    title: "Sem RBAC administrativo",
    severity: "critico",
    detail: "O modelo de usuarios so aceita cliente e diarista. O painel nao tem papel admin nativo para se apoiar.",
  },
  {
    title: "Schema sem migrations versionadas",
    severity: "alto",
    detail: "AutoMigrate acelera o setup, mas enfraquece rollback, auditoria de DDL e governanca entre ambientes.",
  },
  {
    title: "Transicoes de status incoerentes",
    severity: "alto",
    detail: "Ofertas aceitas geram servicos ja em andamento e o fluxo start de services parece inconsistente.",
  },
  {
    title: "Endpoints amplos demais para usuarios autenticados",
    severity: "alto",
    detail: "Usuarios, pagamentos e assinaturas ficam expostos sem autorizacao granular dedicada.",
  },
];

export const resourceConfigs = [
  {
    key: "users",
    path: "usuarios",
    name: "Usuarios",
    headline: "Base cadastral completa da plataforma",
    endpoint: "/users",
    hydrate: hydrateUserPayload,
    transform: normalizeUsers,
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nome" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Telefone", render: (row) => formatPhone(row.phone) },
      { key: "role", label: "Papel", kind: "status" },
      { key: "city", label: "Cidade" },
      { key: "created_at", label: "Criado em", render: (row) => formatDate(row.created_at) },
    ],
    highlights: [
      { label: "Clientes", compute: (rows) => rows.filter((row) => row.role === "cliente").length },
      { label: "Diaristas", compute: (rows) => rows.filter((row) => row.role === "diarista").length },
      { label: "Com cidade", compute: (rows) => rows.filter((row) => row.city && row.city !== "-").length },
    ],
  },
  {
    key: "diarists",
    path: "diaristas",
    name: "Diaristas",
    headline: "Recorte operacional dos profissionais da rede",
    endpoint: "/users",
    hydrate: hydrateUserPayload,
    transform: (payload) => {
      const items = normalizeUsers(payload);
      return items.filter((user) => user.role === "diarista");
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Profissional" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Telefone", render: (row) => formatPhone(row.phone) },
      { key: "experience_years", label: "Experiencia" },
      { key: "price_per_hour", label: "Hora", render: (row) => formatCurrency(row.price_per_hour) },
      { key: "available", label: "Disponivel", kind: "status", render: (row) => (row.available ? "ativo" : "indisponivel") },
      { key: "city", label: "Cidade" },
    ],
    highlights: [
      { label: "Disponiveis", compute: (rows) => rows.filter((row) => row.available).length },
      { label: "Preco/h medio", compute: (rows) => formatCurrency(rows.length ? rows.reduce((sum, row) => sum + Number(row.price_per_hour || 0), 0) / rows.length : 0) },
      { label: "Com perfil", compute: (rows) => rows.filter((row) => row.experience_years !== undefined).length },
    ],
  },
  {
    key: "services",
    path: "servicos",
    name: "Servicos",
    headline: "Agenda, execucao e historico de atendimento",
    endpoint: "/services",
    transform: normalizeServices,
    columns: [
      { key: "id", label: "ID" },
      { key: "service_type", label: "Servico" },
      { key: "status", label: "Status", kind: "status" },
      { key: "total_price", label: "Valor", render: (row) => formatCurrency(row.total_price) },
      { key: "duration_hours", label: "Horas" },
      { key: "scheduled_at", label: "Agendado", render: (row) => formatDate(row.scheduled_at) },
      { key: "client_name", label: "Cliente" },
      { key: "diarist_name", label: "Diarista" },
    ],
    highlights: [
      { label: "Receita agendada", compute: (rows) => formatCurrency(rows.reduce((sum, row) => sum + Number(row.total_price || 0), 0)) },
      { label: "Pendentes", compute: (rows) => rows.filter((row) => row.status === "pendente").length },
      { label: "Concluidos", compute: (rows) => rows.filter((row) => String(row.status).includes("concl")).length },
    ],
  },
  {
    key: "offers",
    path: "ofertas",
    name: "Ofertas",
    headline: "Mural, negociacoes e aceite",
    endpoint: "/offers",
    transform: normalizeOffers,
    columns: [
      { key: "id", label: "ID" },
      { key: "client_name", label: "Cliente" },
      { key: "service_type", label: "Tipo" },
      { key: "status", label: "Status", kind: "status" },
      { key: "current_value", label: "Valor atual", render: (row) => formatCurrency(row.current_value) },
      { key: "initial_value", label: "Valor inicial", render: (row) => formatCurrency(row.initial_value) },
      { key: "negotiations_count", label: "Negociacoes" },
      { key: "scheduled_at", label: "Agendado", render: (row) => formatDate(row.scheduled_at) },
    ],
    highlights: [
      { label: "Abertas", compute: (rows) => rows.filter((row) => row.status === "aberta").length },
      { label: "Em negociacao", compute: (rows) => rows.filter((row) => row.status === "negociacao").length },
      { label: "Valor corrente", compute: (rows) => formatCurrency(rows.reduce((sum, row) => sum + Number(row.current_value || 0), 0)) },
    ],
  },
  {
    key: "payments",
    path: "pagamentos",
    name: "Pagamentos",
    headline: "Fluxo financeiro por servico",
    endpoint: "/payments",
    transform: normalizePayments,
    columns: [
      { key: "id", label: "ID" },
      { key: "service_id", label: "Servico" },
      { key: "client_id", label: "Cliente" },
      { key: "diarist_id", label: "Diarista" },
      { key: "amount", label: "Valor", render: (row) => formatCurrency(row.amount) },
      { key: "status", label: "Status", kind: "status" },
      { key: "method", label: "Metodo" },
      { key: "paid_at", label: "Pago em", render: (row) => formatDate(row.paid_at) },
    ],
    highlights: [
      { label: "Volume total", compute: (rows) => formatCurrency(rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)) },
      { label: "Pendentes", compute: (rows) => rows.filter((row) => row.status === "pendente").length },
      { label: "Pagos", compute: (rows) => rows.filter((row) => ["paid", "pago", "aprovado"].includes(String(row.status).toLowerCase())).length },
    ],
  },
  {
    key: "reviews",
    path: "reviews",
    name: "Reviews",
    headline: "Qualidade, reputacao e reciprocidade",
    endpoint: "/reviews",
    useApiBase: false,
    transform: normalizeReviews,
    columns: [
      { key: "id", label: "ID" },
      { key: "service_id", label: "Servico" },
      { key: "client_id", label: "Cliente" },
      { key: "diarist_id", label: "Diarista" },
      { key: "avg", label: "Media", render: reviewAverage },
      { key: "client_comment", label: "Comentario cliente" },
      { key: "diarist_comment", label: "Comentario diarista" },
    ],
    highlights: [
      { label: "Media geral", compute: (rows) => rows.length ? (rows.reduce((sum, row) => sum + Number(row.average_rating || 0), 0) / rows.length).toFixed(1) : "0.0" },
      { label: "Notas 5", compute: (rows) => rows.filter((row) => Number(row.average_rating || 0) >= 5).length },
      { label: "Com comentario", compute: (rows) => rows.filter((row) => row.client_comment || row.diarist_comment).length },
    ],
  },
  {
    key: "subscriptions",
    path: "assinaturas",
    name: "Assinaturas",
    headline: "Planos, expiracao e recorrencia",
    endpoint: "/subscriptions",
    transform: normalizeSubscriptions,
    columns: [
      { key: "id", label: "ID" },
      { key: "user_id", label: "Usuario" },
      { key: "plan", label: "Plano", kind: "status" },
      { key: "status", label: "Status", kind: "status" },
      { key: "price", label: "Preco", render: (row) => formatCurrency(row.price) },
      { key: "expires_at", label: "Expira em", render: (row) => formatDate(row.expires_at) },
    ],
    highlights: [
      { label: "Ativas", compute: (rows) => rows.filter((row) => row.status === "active").length },
      { label: "MRR visivel", compute: (rows) => formatCurrency(rows.filter((row) => row.status === "active").reduce((sum, row) => sum + Number(row.price || 0), 0)) },
      { label: "Premium", compute: (rows) => rows.filter((row) => row.plan === "premium").length },
    ],
  },
];

export const resourceByKey = Object.fromEntries(resourceConfigs.map((resource) => [resource.key, resource]));
