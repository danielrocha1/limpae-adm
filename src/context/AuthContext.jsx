import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const TOKEN_KEY = "limpae_admin_token";
const ROLE_KEY = "limpae_admin_role";
const NAME_KEY = "limpae_admin_name";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || "");
  const [adminName, setAdminName] = useState(() => localStorage.getItem(NAME_KEY) || "Admin Limpae");
  const [status, setStatus] = useState(token ? "authenticated" : "anonymous");
  const [error, setError] = useState("");

  async function login(credentials) {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://limpae-adm.onrender.com"}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Falha ao autenticar.");
      }

      const data = await response.json();
      const nextToken = data.token;
      const nextRole = data.role || "admin";
      const nextName = data.name || credentials?.email?.split("@")[0] || "Admin Limpae";

      setToken(nextToken);
      setRole(nextRole);
      setAdminName(nextName);
      setStatus("authenticated");
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(ROLE_KEY, nextRole);
      localStorage.setItem(NAME_KEY, nextName);
      return { token: nextToken, role: nextRole, name: nextName };
    } catch (requestError) {
      setStatus("anonymous");
      setError(requestError.message || "Falha ao autenticar.");
      throw requestError;
    }
  }

  function logout() {
    setToken("");
    setRole("");
    setAdminName("Admin Limpae");
    setError("");
    setStatus("anonymous");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
  }

  const value = useMemo(
    () => ({
      adminName,
      error,
      isAuthenticated: Boolean(token),
      login,
      logout,
      role,
      status,
      token,
    }),
    [adminName, error, role, status, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa estar dentro de AuthProvider.");
  }
  return context;
}
