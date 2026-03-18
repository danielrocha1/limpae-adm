import { auditFindings } from "../resources";

const recommendations = [
  "Introduzir papel admin e middleware de autorizacao granular.",
  "Substituir AutoMigrate como estrategia primaria por migrations versionadas.",
  "Criar endpoints administrativos dedicados com filtros, paginacao e trilha de auditoria.",
  "Normalizar a maquina de estados de servicos, ofertas, pagamentos e assinaturas.",
  "Modelar especialidades e eventos operacionais de forma mais analitica.",
];

export function BackendAuditPage() {
  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Auditoria tecnica</span>
          <h2>Backend e DBA do Limpae</h2>
          <p>Resumo de arquitetura, fragilidades e recomendacoes para endurecer a operacao administrativa.</p>
        </div>
      </header>

      <section className="panel-grid compact">
        <article className="info-panel">
          <span className="eyebrow">Stack</span>
          <strong>Go + Fiber + GORM + PostgreSQL</strong>
          <p>Backend funcional, mas ainda sem camada administrativa dedicada.</p>
        </article>
        <article className="info-panel">
          <span className="eyebrow">Schema</span>
          <strong>AutoMigrate e modelos ricos</strong>
          <p>Boa velocidade de evolucao, com custo alto de governanca e reproducibilidade.</p>
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

      <section className="table-card">
        <div className="section-heading">
          <h3>Recomendacoes prioritarias</h3>
          <p>Roteiro de endurecimento para a proxima fase do backend.</p>
        </div>
        <ol className="recommendation-list">
          {recommendations.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>
    </section>
  );
}
