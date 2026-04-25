import { auditFindings } from "../resources";

const recommendations = [
  "Implementar ações de CRUD (editar/excluir) diretamente na interface administrativa.",
  "Adicionar paginação e busca no lado do servidor (Server-side filtering) para lidar com grandes volumes de dados.",
  "Configurar uma trilha de auditoria (Audit Log) para registrar ações feitas por administradores.",
  "Normalizar a máquina de estados de serviços e pagamentos para garantir integridade.",
  "Substituir AutoMigrate como estratégia primária por migrations versionadas no banco de dados.",
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
          <p>Backend robusto com camada administrativa dedicada e RBAC ativo.</p>
        </article>
        <article className="info-panel">
          <span className="eyebrow">Interface</span>
          <strong>React + Vite + Context API</strong>
          <p>Painel moderno consumindo dados reais com estratégias de fallback.</p>
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
