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
    <div className="grid min-h-screen place-items-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Limpae Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesso administrativo simulado para operar o painel.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <label className="block space-y-2 text-sm font-medium">
            <span>Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
          </label>

          <label className="block space-y-2 text-sm font-medium">
            <span>Senha</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
          </label>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
