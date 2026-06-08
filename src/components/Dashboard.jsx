import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings, Plus, History, FileText,
  Users, BarChart3, Package, TrendingUp, Clock,
} from "lucide-react";
import { getInvoiceStats } from "../services/db";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { setStats(await getInvoiceStats()); } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const fmt = (v) => {
    if (!v) return "۰";
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return Number(v).toLocaleString("fa-IR");
  };

  const navCards = [
    { path: "/history", icon: History, label: "تاریخچه", sub: "مشاهده فاکتورها", color: "blue" },
    { path: "/customers", icon: Users, label: "مشتریان", sub: "مدیریت مشتریان", color: "purple" },
    { path: "/products", icon: Package, label: "کالا / خدمات", sub: "مدیریت محصولات", color: "emerald" },
    { path: "/reports", icon: BarChart3, label: "گزارش‌ها", sub: "آمار و تحلیل", color: "amber" },
  ];

  const colorMap = {
    blue:    { bg: "var(--accent-muted)", text: "var(--accent)" },
    purple:  { bg: "var(--purple-muted)", text: "var(--purple)" },
    emerald: { bg: "var(--success-muted)", text: "var(--success)" },
    amber:   { bg: "var(--warning-muted)", text: "var(--warning)" },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-1)] font-sans" dir="rtl">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 glass border-b-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--accent)" }}>
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-black tracking-tight text-[var(--text-1)]">FastInvo</span>
          </div>
          <button onClick={() => navigate("/settings")}
            className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-2)] active:scale-90 transition-all">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-2xl mx-auto px-5 py-6 w-full space-y-5 page-pad">

        {/* Quick Stats */}
        {!isLoading && stats && stats.total > 0 && (
          <div className="grid grid-cols-3 gap-2.5 animate-fade-in">
            {[
              { icon: TrendingUp, value: fmt(stats.totalRevenue), label: "درآمد", color: "var(--success)" },
              { icon: FileText, value: stats.total, label: "فاکتور", color: "var(--accent)" },
              { icon: Clock, value: fmt(stats.pendingAmount), label: "در انتظار", color: "var(--warning)" },
            ].map((s, i) => (
              <div key={i} className="card rounded-2xl p-3.5 text-center space-y-1">
                <s.icon size={16} className="mx-auto" style={{ color: s.color }} />
                <p className="text-sm font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] text-[var(--text-3)] font-bold uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Hero CTA */}
        <button onClick={() => navigate("/create-invoice")}
          className="w-full relative overflow-hidden rounded-3xl p-7 flex flex-col items-center text-center cursor-pointer active:scale-[0.97] transition-all group min-h-[180px] justify-center"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))", boxShadow: "var(--shadow-glow)" }}>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-3.5 rounded-2xl mb-4 backdrop-blur-md group-hover:scale-110 transition-all duration-300">
              <Plus className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-black text-white mb-1.5">صدور فاکتور جدید</h1>
            <p className="text-white/60 text-xs font-medium">ایجاد فاکتور حرفه‌ای در کمتر از یک دقیقه</p>
          </div>
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl" style={{ background: "var(--accent-glow)" }} />
        </button>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {navCards.map((card) => {
            const c = colorMap[card.color];
            return (
              <button key={card.path} onClick={() => navigate(card.path)}
                className="card rounded-2xl p-5 flex flex-col items-center text-center gap-2.5 active:scale-[0.96] transition-all"
                style={{ borderColor: "var(--border-subtle)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                  <card.icon size={22} style={{ color: c.text }} />
                </div>
                <span className="font-black text-sm text-[var(--text-1)]">{card.label}</span>
                <span className="text-[9px] text-[var(--text-3)] font-medium">{card.sub}</span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="py-3 text-center">
        <p className="text-[8px] text-[var(--text-3)] font-bold tracking-widest uppercase">FastInvo Pro v2.0</p>
      </footer>
    </div>
  );
};

export default Dashboard;
