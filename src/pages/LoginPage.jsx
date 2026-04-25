import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { error, isAuthenticated, login, logout, status } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    try {
      const result = await login(form);
      if (result.role !== "admin") {
        logout();
        throw new Error("Acesso negado: apenas administradores podem acessar este painel.");
      }
    } catch (requestError) {
      if (requestError.message.includes("Acesso negado")) {
        logout();
      }
      setLocalError(requestError.message || "Falha ao autenticar.");
    }
  }

  return (
    <section className="login-layout">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-header">
          <h2>Entrar no Painel</h2>
          <p>Use suas credenciais para acessar a administração.</p>
        </div>

        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="admin@limpae.com"
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Sua senha"
            required
          />
        </label>
        {(localError || error) && <div className="callout danger">{localError || error}</div>}
        <button className="primary-button" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Autenticando..." : "Acessar painel"}
        </button>
      </form>
    </section>
  );
}
