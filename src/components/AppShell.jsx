import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resourceConfigs } from "../resources";

export function AppShell() {
  const { apiOrigin, logout, role } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="eyebrow">Limpae</span>
          <h1>Painel Admin</h1>
          <p>Operacao, governanca e monitoramento de ponta a ponta.</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          {resourceConfigs.map((resource) => (
            <NavLink key={resource.key} to={`/${resource.path}`}>{resource.name}</NavLink>
          ))}
          <NavLink to="/auditoria">Auditoria backend</NavLink>
        </nav>

        <div className="sidebar-footer">
          <div>
            <span className="eyebrow">Sessao</span>
            <strong>{role || "sem papel resolvido"}</strong>
          </div>
          <button className="ghost-button" onClick={logout}>Sair</button>
          <small>API alvo: {apiOrigin}</small>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
