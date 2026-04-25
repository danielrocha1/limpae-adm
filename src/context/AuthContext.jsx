import { createContext, useContext, useMemo, useState } from "react";
import { apiUrl, requestJson } from "../lib/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "limpae_admin_token";
const ROLE_KEY = "limpae_admin_role";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || "");
  const [status, setStatus] = useState(token ? "authenticated" : "anonymous");
  const [error, setError] = useState("");

  async function login(credentials) {
    setStatus("loading");
    setError("");

    // Simulação de delay para feedback visual
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Login puramente local conforme solicitado
    if (
      credentials.email === "admin@limpae.com" &&
      credentials.password === "admin123"
    ) {
      const genericToken = "generic-admin-token-limpae";
      const genericRole = "admin";

      setToken(genericToken);
      setRole(genericRole);
      setStatus("authenticated");
      localStorage.setItem(TOKEN_KEY, genericToken);
      localStorage.setItem(ROLE_KEY, genericRole);
      return { token: genericToken, role: genericRole };
    } else {
      setStatus("anonymous");
      const errorMsg = "Credenciais inválidas para o painel administrativo.";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  function logout() {
    setToken("");
    setRole("");
    setError("");
    setStatus("anonymous");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  }

  const value = useMemo(
    () => ({
      apiOrigin: apiUrl,
      error,
      isAuthenticated: Boolean(token),
      login,
      logout,
      role,
      status,
      token,
    }),
    [error, role, status, token]
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
