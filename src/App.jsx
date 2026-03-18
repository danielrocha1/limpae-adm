import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { CollectionPage } from "./pages/CollectionPage";
import { LoginPage } from "./pages/LoginPage";
import { BackendAuditPage } from "./pages/BackendAuditPage";
import { resourceConfigs } from "./resources";

function PrivateOutlet() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShell /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateOutlet />}>
        <Route index element={<DashboardPage />} />
        {resourceConfigs.map((resource) => (
          <Route
            key={resource.key}
            path={resource.path}
            element={<CollectionPage resourceKey={resource.key} />}
          />
        ))}
        <Route path="auditoria" element={<BackendAuditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
