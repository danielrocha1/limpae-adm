import { useMemo, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminData } from "../hooks/useAdminData";
import { resourceByKey } from "../resources";

export function CollectionPage({ resourceKey }) {
  const resource = resourceByKey[resourceKey];
  const { data, error, loading, meta, reload } = useAdminData(resourceKey);
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(term));
  }, [data, search]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h2>{resource.name}</h2>
          <p>{resource.headline}</p>
        </div>
        <div className="header-actions">
          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Filtrar ${resource.name.toLowerCase()}...`}
          />
          <button className="primary-button" onClick={reload}>
            🔄 Atualizar
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card ocean">
          <span className="eyebrow">Status da Conexão</span>
          <strong>{meta.source === "api" ? "Online" : "Contingência"}</strong>
          <p>{meta.source === "api" ? "Recebendo dados em tempo real do backend." : "Backend indisponível, usando cache local."}</p>
        </div>
        <div className="stat-card forest">
          <span className="eyebrow">Total de Registros</span>
          <strong>{filteredData.length}</strong>
          <p>Itens encontrados na listagem atual.</p>
        </div>
        {Array.isArray(resource.highlights) && resource.highlights.map((highlight) => (
          <div className="stat-card sun" key={highlight.label}>
            <span className="eyebrow">{highlight.label}</span>
            <strong>{highlight.compute(filteredData)}</strong>
            <p>Métrica calculada para este módulo.</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="status-badge danger" style={{ padding: '12px 20px', borderRadius: '8px', width: '100%', justifyContent: 'center' }}>
          ⚠️ Erro na API: {error}
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ color: var(--muted) }}>Carregando dados do servidor...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredData.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {resource.columns.map((column) => <th key={column.key}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={row.id || `${resourceKey}-${index}`}>
                    {resource.columns.map((column) => {
                      const value = column.render ? column.render(row) : row[column.key];
                      return (
                        <td key={column.key}>
                          {column.kind === "status" ? (
                            <StatusBadge value={value} />
                          ) : (
                            <span style={{ fontWeight: column.key === 'id' ? '600' : '400', color: column.key === 'id' ? 'var(--ocean)' : 'inherit' }}>
                              {value || "-"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--muted)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>📂</span>
            <p>Nenhum registro encontrado para este módulo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
