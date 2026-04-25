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
      <div className="login-hero">
        <span className="eyebrow">Limpae Admin</span>
        <h1>Painel administrativo robusto para o ecossistema Limpae</h1>
        <p>
          Consolide usuarios, operacao, financeiro, reputacao e auditoria tecnica do
          backend em uma unica superficie.
        </p>
        <div className="callout success">
          RBAC Administrativo ativo. Acesso restrito a usuários com perfil de administrador
          para gestão de usuários, serviços e financeiro.
        </div>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
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
