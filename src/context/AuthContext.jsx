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

    try {
      const auth = await requestJson("/login", {
        method: "POST",
        body: JSON.stringify(credentials),
        useApiBase: false,
      });

      const nextToken = auth?.token;
      if (!nextToken) {
        throw new Error("A API não retornou um token de acesso válido.");
      }

      const nextRole = auth?.role || "user";

      setToken(nextToken);
      setRole(nextRole);
      setStatus("authenticated");
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(ROLE_KEY, nextRole);
      return { token: nextToken, role: nextRole };
    } catch (requestError) {
      setStatus("anonymous");
      setError(requestError.message || "Falha ao autenticar com o servidor.");
      throw requestError;
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
