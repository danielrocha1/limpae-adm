import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  Command,
  HandCoins,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, description: "Resumo geral" },
  { name: "Clientes", href: "/clientes", icon: UserRound, description: "Usuarios contratantes" },
  { name: "Diaristas", href: "/diaristas", icon: Users, description: "Profissionais" },
  { name: "Serviços", href: "/servicos", icon: BriefcaseBusiness, description: "Agenda e execucao" },
  { name: "Ofertas", href: "/ofertas", icon: HandCoins, description: "Mural e negociacoes" },
  { name: "Mapa", href: "/mapa", icon: MapPinned, description: "Usuarios no mapa" },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("limpae_theme") === "dark");
  const location = useLocation();
  const navigate = useNavigate();
  const { adminName, logout } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("limpae_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-foreground dark:bg-[#07111f]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-56 bg-[linear-gradient(135deg,rgba(20,184,166,0.18),rgba(14,165,233,0.12),rgba(244,63,94,0.08))]" />

      {sidebarOpen && (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto border-r border-white/10 bg-[#0b1726] text-slate-100 shadow-2xl transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-white/10 p-5">
          <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-400 text-base font-black text-slate-950 shadow-lg shadow-teal-500/20">
              L
            </div>
            <div>
              <p className="text-base font-bold leading-tight">Limpae Admin</p>
              <p className="text-xs text-slate-400">Central operacional</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="absolute right-3 top-3 text-slate-300 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="px-5 py-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <ShieldCheck className="h-4 w-4 text-teal-300" />
              Sessao administrativa
            </div>
            <p className="mt-2 truncate text-sm font-semibold">{adminName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-white text-slate-950 shadow-lg"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-md",
                    isActive ? "bg-teal-100 text-teal-700" : "bg-white/[0.06] text-slate-300 group-hover:text-teal-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-semibold">{item.name}</span>
                  <span className={cn("text-xs", isActive ? "text-slate-500" : "text-slate-500")}>{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">API ativa</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_0_4px_rgba(45,212,191,0.12)]" />
              REST Users
            </span>
            <span className="text-slate-500">online</span>
          </div>
        </div>

        <div className="border-t border-white/10 p-3">
          <Button variant="ghost" className="w-full justify-start text-rose-300 hover:bg-rose-500/10 hover:text-rose-200" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="relative flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 lg:px-8">
          <div className="flex h-16 items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="hidden flex-1 md:block">
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  aria-label="Busca global"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white/80 pl-10 pr-24 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10 dark:border-white/10 dark:bg-white/5"
                  placeholder="Buscar usuarios, emails ou CPF"
                />
                <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border bg-slate-50 px-2 py-1 text-xs text-slate-500 dark:border-white/10 dark:bg-white/10 md:flex">
                  <Command className="h-3 w-3" /> K
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setDarkMode((value) => !value)} aria-label="Alternar tema">
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notificacoes" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              </Button>
              <div className="ml-2 hidden text-right sm:block">
                <p className="text-sm font-semibold">{adminName}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-sm font-bold text-white dark:bg-teal-400 dark:text-slate-950">
                {adminName.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
