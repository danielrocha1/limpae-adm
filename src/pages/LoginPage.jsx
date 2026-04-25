import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@limpae.com.br');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulando delay de rede
    setTimeout(() => {
      if (email === 'admin@limpae.com.br' && password === 'admin123') {
        localStorage.setItem('admin-token', 'mock-jwt-token-admin');
        addToast('Bem-vindo ao Painel Administrativo!', 'success');
        navigate('/');
      } else {
        addToast('Credenciais inválidas. Use o acesso padrão.', 'error');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Painel Admin</h1>
          <p className="text-muted-foreground">Entre com suas credenciais para gerenciar a Limpae</p>
        </div>

        <div className="bg-card border shadow-xl rounded-2xl p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="admin@limpae.com.br"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no Sistema'}
            </button>
          </form>

          <div className="pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Acesso restrito a administradores autorizados.
            </p>
          </div>
        </div>

        {/* Demo Credentials Alert */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400">
          <p className="text-xs font-bold mb-1 uppercase tracking-wider">Acesso de Demonstração:</p>
          <p className="text-xs">Email: <span className="font-mono">admin@limpae.com.br</span></p>
          <p className="text-xs">Senha: <span className="font-mono">admin123</span></p>
        </div>
      </div>
    </div>
  );
}
