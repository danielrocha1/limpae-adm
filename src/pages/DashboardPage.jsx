import { StatCard } from "../components/StatCard";
import { useAdminData } from "../hooks/useAdminData";
import { averageBy, formatCurrency, sumBy } from "../lib/formatters";
import { auditFindings } from "../resources";

export function DashboardPage() {
  const users = useAdminData("users");
  const services = useAdminData("services");
  const reviews = useAdminData("reviews");

  const dashboardStats = {
    users: users.data.length,
    services: services.data.length,
    total_revenue: services.data.reduce((sum, s) => sum + Number(s.total_price || 0), 0),
    diarists: users.data.filter(u => u.role === "diarista").length,
  };

  const reviewItems = reviews.data.map((review) => ({
    rating:
      review.client_rating && review.diarist_rating
        ? (Number(review.client_rating) + Number(review.diarist_rating)) / 2
        : Number(review.client_rating || review.diarist_rating || 0),
  }));

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Visao executiva</span>
          <h2>Operacao central do Limpae</h2>
          <p>Um cockpit unico para monitorar marketplace, risco operacional e maturidade tecnica.</p>
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <span className="eyebrow">Resumo da stack</span>
          <h3>React admin sobre um backend Fiber + GORM com PostgreSQL</h3>
          <p>
            O painel consome os endpoints originais da API com 
            controle de acesso administrativo e pre-load de dados.
          </p>
        </div>
        <div className="hero-tags">
          <span>Admin RBAC</span>
          <span>Endpoints Dedicados</span>
          <span>Auditoria Real</span>
          <span>Performance Otimizada</span>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Usuarios" value={dashboardStats.users} detail="Base total cadastrada" />
        <StatCard label="Diaristas" value={dashboardStats.diarists} detail="Profissionais ativos" accent="ocean" />
        <StatCard label="Servicos" value={dashboardStats.services} detail="Total de atendimentos" accent="storm" />
        <StatCard label="Receita Real" value={formatCurrency(dashboardStats.total_revenue)} detail="Volume financeiro aprovado" accent="forest" />
        <StatCard label="Media reviews" value={averageBy(reviewItems, "rating").toFixed(1)} detail="Qualidade percebida" accent="sun" />
      </section>

      <section className="panel-grid">
        <article className="info-panel">
          <span className="eyebrow">Risco imediato</span>
          <strong>{auditFindings.length} pontos relevantes no backend</strong>
          <p>Os maiores riscos hoje estao em autorizacao, governanca de schema e consistencia de estados.</p>
        </article>
        <article className="info-panel">
          <span className="eyebrow">Fonte dos dados</span>
          <strong>Conectado ao backend real do repo</strong>
          <p>Quando a API falha, o painel entra em modo de contingencia sem quebrar a interface.</p>
        </article>
        <article className="info-panel">
          <span className="eyebrow">Recorte de produto</span>
          <strong>Marketplace de limpeza com mural e recorrencia</strong>
          <p>O painel cobre base cadastral, agenda, financeiro, reputacao e trilha de endurecimento.</p>
        </article>
      </section>

      <section className="audit-list">
        {auditFindings.map((finding) => (
          <article className="audit-item" key={finding.title}>
            <div>
              <span className={`severity ${finding.severity}`}>{finding.severity}</span>
              <h4>{finding.title}</h4>
            </div>
            <p>{finding.detail}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
