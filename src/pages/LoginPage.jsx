import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@limpae.com.br");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      addToast("Sessao administrativa iniciada.", "success");
      navigate("/");
    } catch (err) {
      addToast(err.message || "Nao foi possivel autenticar.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.32),rgba(14,165,233,0.20),rgba(244,63,94,0.18))]" />
        <div className="relative">
          <div className="inline-flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-teal-300 font-black text-slate-950">L</div>
            <div>
              <p className="font-bold">Limpae Admin</p>
              <p className="text-xs text-slate-300">Painel operacional</p>
            </div>
          </div>
        </div>
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-200">Backoffice</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">Gestao limpa para uma operacao que precisa andar.</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Clientes, diaristas, verificacoes e perfis em uma interface focada em tomada de decisao.
          </p>
        </div>
      </section>

      <section className="grid place-items-center bg-[#f4f7fb] p-4 text-slate-950 dark:bg-[#07111f] dark:text-white">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg bg-teal-400 text-slate-950">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black">Limpae Admin</h1>
          </div>

          <form onSubmit={handleLogin} className="rounded-xl border bg-white p-6 shadow-xl ring-1 ring-slate-200/70 dark:bg-white/[0.05] dark:ring-white/10">
            <div className="mb-6">
              <BadgeTitle />
              <h2 className="mt-4 text-2xl font-black">Entrar no painel</h2>
              <p className="mt-2 text-sm text-muted-foreground">Autenticacao mock para acesso administrativo.</p>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2 text-sm font-semibold">
                <span>Email</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-11 rounded-lg pl-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </div>
              </label>

              <label className="block space-y-2 text-sm font-semibold">
                <span>Senha</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-11 rounded-lg pl-10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </div>
              </label>
            </div>

            <Button className="mt-6 h-11 w-full rounded-lg bg-slate-950 text-white hover:bg-slate-800 dark:bg-teal-400 dark:text-slate-950" type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Entrar
            </Button>

            <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
              Demo: admin@limpae.com.br / admin123
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function BadgeTitle() {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-teal-500/10 px-3 py-2 text-sm font-bold text-teal-700 dark:text-teal-300">
      <ShieldCheck className="h-4 w-4" />
      Acesso seguro
    </div>
  );
}
