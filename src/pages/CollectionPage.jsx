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
    <section className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">Modulo operacional</span>
          <h2>{resource.name}</h2>
          <p>{resource.headline}</p>
        </div>
        <div className="header-actions">
          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Buscar em ${resource.name.toLowerCase()}`}
          />
          <button className="ghost-button" onClick={reload}>Atualizar</button>
        </div>
      </header>

      <div className="panel-grid compact">
        <article className="info-panel">
          <span className="eyebrow">Origem</span>
          <strong>{meta.source === "api" ? "API em tempo real" : "Fallback controlado"}</strong>
          <p>{meta.source === "api" ? "Dados lidos do backend Go atual." : "Mostrando dataset de contingencia para preservar a UX."}</p>
        </article>
        <article className="info-panel">
          <span className="eyebrow">Volume</span>
          <strong>{filteredData.length}</strong>
          <p>Itens filtrados prontos para analise e operacao.</p>
        </article>
      </div>

      {error && <div className="callout warning">Falha ao consultar a API: {error}</div>}

      <section className="table-card">
        {loading ? (
          <div className="empty-state">Carregando {resource.name.toLowerCase()}...</div>
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
                      return <td key={column.key}>{column.kind === "status" ? <StatusBadge value={value} /> : value || "-"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">Nenhum registro disponivel para este modulo.</div>
        )}
      </section>
    </section>
  );
}
