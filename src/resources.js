import { formatCurrency, formatDate, formatPhone } from "./lib/formatters";

const reviewAverage = (item) => {
  const values = [Number(item?.client_rating || 0), Number(item?.diarist_rating || 0)].filter(Boolean);
  if (!values.length) return "-";
  return (values.reduce((accumulator, current) => accumulator + current, 0) / values.length).toFixed(1);
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
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nome" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Telefone", render: (row) => formatPhone(row.phone) },
      { key: "role", label: "Papel", kind: "status" },
      { key: "created_at", label: "Criado em", render: (row) => formatDate(row.created_at) },
    ],
  },
  {
    key: "diarists",
    path: "diaristas",
    name: "Diaristas",
    headline: "Recorte operacional dos profissionais da rede",
    endpoint: "/users",
    transform: (payload) => {
      const items = Array.isArray(payload) ? payload : payload?.items || [];
      return items.filter((user) => user.role === "diarista");
    },
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Profissional" },
      { key: "email", label: "E-mail" },
      { key: "phone", label: "Telefone", render: (row) => formatPhone(row.phone) },
      { key: "role", label: "Tipo", kind: "status" },
    ],
  },
  {
    key: "services",
    path: "servicos",
    name: "Servicos",
    headline: "Agenda, execucao e historico de atendimento",
    endpoint: "/services",
    columns: [
      { key: "id", label: "ID" },
      { key: "service_type", label: "Servico" },
      { key: "status", label: "Status", kind: "status" },
      { key: "total_price", label: "Valor", render: (row) => formatCurrency(row.total_price) },
      { key: "duration_hours", label: "Horas" },
      { key: "scheduled_at", label: "Agendado", render: (row) => formatDate(row.scheduled_at) },
      { key: "client", label: "Cliente", render: (row) => row.client?.name || row.client_name || "-" },
      { key: "diarist", label: "Diarista", render: (row) => row.diarist?.name || row.diarist_name || "-" },
    ],
  },
  {
    key: "offers",
    path: "ofertas",
    name: "Ofertas",
    headline: "Mural, negociacoes e aceite",
    endpoint: "/offers",
    columns: [
      { key: "id", label: "ID" },
      { key: "service_type", label: "Tipo" },
      { key: "status", label: "Status", kind: "status" },
      { key: "current_value", label: "Valor atual", render: (row) => formatCurrency(row.current_value) },
      { key: "initial_value", label: "Valor inicial", render: (row) => formatCurrency(row.initial_value) },
      { key: "scheduled_at", label: "Agendado", render: (row) => formatDate(row.scheduled_at) },
    ],
  },
  {
    key: "payments",
    path: "pagamentos",
    name: "Pagamentos",
    headline: "Fluxo financeiro por servico",
    endpoint: "/payments",
    columns: [
      { key: "id", label: "ID" },
      { key: "service_id", label: "Servico" },
      { key: "amount", label: "Valor", render: (row) => formatCurrency(row.amount) },
      { key: "status", label: "Status", kind: "status" },
      { key: "method", label: "Metodo" },
      { key: "paid_at", label: "Pago em", render: (row) => formatDate(row.paid_at) },
    ],
  },
  {
    key: "reviews",
    path: "reviews",
    name: "Reviews",
    headline: "Qualidade, reputacao e reciprocidade",
    endpoint: "/reviews",
    useApiBase: false,
    columns: [
      { key: "id", label: "ID" },
      { key: "service_id", label: "Servico" },
      { key: "client_id", label: "Cliente" },
      { key: "diarist_id", label: "Diarista" },
      { key: "avg", label: "Media", render: reviewAverage },
      { key: "client_comment", label: "Comentario cliente" },
    ],
  },
  {
    key: "subscriptions",
    path: "assinaturas",
    name: "Assinaturas",
    headline: "Planos, expiracao e recorrencia",
    endpoint: "/subscriptions",
    columns: [
      { key: "id", label: "ID" },
      { key: "user_id", label: "Usuario" },
      { key: "plan", label: "Plano", kind: "status" },
      { key: "status", label: "Status", kind: "status" },
      { key: "price", label: "Preco", render: (row) => formatCurrency(row.price) },
      { key: "expires_at", label: "Expira em", render: (row) => formatDate(row.expires_at) },
    ],
  },
];

export const resourceByKey = Object.fromEntries(resourceConfigs.map((resource) => [resource.key, resource]));
