import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resourceConfigs } from "../resources";

// Componente de Ícone Simples (substituindo necessidade de biblioteca externa por agora)
const Icon = ({ name }) => {
  const icons = {
    dashboard: "📊",
    users: "👥",
    diarists: "🧹",
    services: "💼",
    offers: "🏷️",
    payments: "💰",
    subscriptions: "💳",
    reviews: "⭐",
    audit: "🔍",
    logout: "🚪"
  };
  return <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>{icons[name] || "•"}</span>;
};

export function AppShell() {
  const { apiOrigin, logout, role } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <h1>Limpae</h1>
          <p>Painel de Controle</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
            <Icon name="dashboard" /> Dashboard
          </NavLink>
          
          <div className="nav-group">
            <span className="nav-group-title">Gestão Principal</span>
            {resourceConfigs.filter(r => ["users", "diarists"].includes(r.key)).map((resource) => (
              <NavLink key={resource.key} to={`/${resource.path}`} className={({ isActive }) => isActive ? "active" : ""}>
                <Icon name={resource.key} /> {resource.name}
              </NavLink>
            ))}
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Operações</span>
            {resourceConfigs.filter(r => ["services", "offers"].includes(r.key)).map((resource) => (
              <NavLink key={resource.key} to={`/${resource.path}`} className={({ isActive }) => isActive ? "active" : ""}>
                <Icon name={resource.key} /> {resource.name}
              </NavLink>
            ))}
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Financeiro</span>
            {resourceConfigs.filter(r => ["payments", "subscriptions"].includes(r.key)).map((resource) => (
              <NavLink key={resource.key} to={`/${resource.path}`} className={({ isActive }) => isActive ? "active" : ""}>
                <Icon name={resource.key} /> {resource.name}
              </NavLink>
            ))}
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Sistema</span>
            {resourceConfigs.filter(r => ["reviews"].includes(r.key)).map((resource) => (
              <NavLink key={resource.key} to={`/${resource.path}`} className={({ isActive }) => isActive ? "active" : ""}>
                <Icon name={resource.key} /> {resource.name}
              </NavLink>
            ))}
            <NavLink to="/auditoria" className={({ isActive }) => isActive ? "active" : ""}>
              <Icon name="audit" /> Auditoria API
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="eyebrow">Administrador</span>
            <strong>{role === "admin" ? "Daniel Rocha" : role}</strong>
          </div>
          <button className="ghost-button" onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="logout" /> Sair do Painel
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
