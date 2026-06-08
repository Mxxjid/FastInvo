import React, { useState, useEffect } from "react";
import { ArrowRight, TrendingUp, DollarSign, FileCheck, FileX, Clock, Download, Loader2, CalendarDays, FileText, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInvoiceStats, exportAllData } from "../services/db";

const ReportsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { (async () => { try { setStats(await getInvoiceStats()); } catch (e) { console.error(e); } finally { setIsLoading(false); } })(); }, []);

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `fastinvo-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch { alert("خطا در خروجی گرفتن"); }
  };

  const fmt = (v) => { if (!v) return "۰"; return Number(v).toLocaleString("fa-IR"); };

  if (isLoading) return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: "var(--accent)" }} size={36} /></div>;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-1)] font-sans" dir="rtl">
      <header className="sticky top-0 z-30 glass" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-2)] active:scale-90 transition-all"><ArrowRight size={20} /></button>
            <h1 className="text-base font-black text-[var(--text-1)]">گزارش‌ها و آمار</h1>
          </div>
          <button onClick={handleExport} className="p-2 rounded-xl bg-[var(--bg-card)] active:scale-90 transition-all" style={{ border: "1px solid var(--border-subtle)" }}><Download size={16} style={{ color: "var(--text-2)" }} /></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5 page-pad">
        {/* Revenue Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "var(--success-muted)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}><TrendingUp size={18} style={{ color: "var(--success)" }} /></div>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--success)" }}>درآمد کل</p>
            <p className="text-lg font-black font-mono" style={{ color: "var(--success)" }}>{fmt(stats?.totalRevenue)}<span className="text-[9px] mr-1" style={{ color: "rgba(34,197,94,0.6)" }}>ریال</span></p>
          </div>
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "var(--warning-muted)", border: "1px solid rgba(245,158,11,0.15)" }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}><Clock size={18} style={{ color: "var(--warning)" }} /></div>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--warning)" }}>در انتظار پرداخت</p>
            <p className="text-lg font-black font-mono" style={{ color: "var(--warning)" }}>{fmt(stats?.pendingAmount)}<span className="text-[9px] mr-1" style={{ color: "rgba(245,158,11,0.6)" }}>ریال</span></p>
            <p className="text-[8px]" style={{ color: "rgba(245,158,11,0.5)" }}>فقط فاکتور فروش</p>
          </div>
        </div>

        {/* Document Summary */}
        <div className="space-y-2.5">
          <h2 className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>خلاصه اسناد</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: FileText, value: stats?.total || 0, label: "کل اسناد", color: "var(--accent)", bg: "var(--accent-muted)" },
              { icon: Receipt, value: stats?.totalSales || 0, label: "فاکتور فروش", color: "var(--accent)", bg: "var(--accent-muted)" },
              { icon: FileCheck, value: stats?.totalProforma || 0, label: "پیش‌فاکتور", color: "var(--purple)", bg: "var(--purple-muted)" },
            ].map((s, i) => (
              <div key={i} className="card rounded-2xl p-3.5 text-center space-y-1.5" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto" style={{ background: s.bg }}><s.icon size={16} style={{ color: s.color }} /></div>
                <p className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="space-y-2.5">
          <h2 className="text-[10px] font-black uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>وضعیت پرداخت فاکتورهای فروش</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: DollarSign, value: stats?.paid || 0, label: "پرداخت شده", color: "var(--success)", bg: "var(--success-muted)" },
              { icon: FileX, value: stats?.unpaid || 0, label: "پرداخت نشده", color: "var(--danger)", bg: "var(--danger-muted)" },
            ].map((s, i) => (
              <div key={i} className="card rounded-2xl p-4 text-center space-y-1.5" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto" style={{ background: s.bg }}><s.icon size={16} style={{ color: s.color }} /></div>
                <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        {stats?.totalSales > 0 && (
          <div className="card rounded-2xl p-4 space-y-3" style={{ borderColor: "var(--border-subtle)" }}>
            <h3 className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>نسبت پرداخت</h3>
            {[
              { label: "پرداخت شده", value: stats.paid, total: stats.totalSales, color: "var(--success)" },
              { label: "پرداخت نشده", value: stats.unpaid, total: stats.totalSales, color: "var(--danger)" },
            ].map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-[9px] font-bold mb-1">
                  <span style={{ color: p.color }}>{p.label}</span>
                  <span style={{ color: "var(--text-3)" }}>{Math.round((p.value / p.total) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(p.value / p.total) * 100}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => navigate("/create-invoice")} className="card rounded-2xl p-4 text-right space-y-1.5 active:scale-95 transition-all" style={{ borderColor: "var(--border-subtle)" }}>
            <CalendarDays size={20} style={{ color: "var(--accent)" }} />
            <p className="font-black text-sm text-[var(--text-1)]">فاکتور جدید</p>
            <p className="text-[9px]" style={{ color: "var(--text-3)" }}>صدور سریع</p>
          </button>
          <button onClick={() => navigate("/history")} className="card rounded-2xl p-4 text-right space-y-1.5 active:scale-95 transition-all" style={{ borderColor: "var(--border-subtle)" }}>
            <FileCheck size={20} style={{ color: "var(--success)" }} />
            <p className="font-black text-sm text-[var(--text-1)]">تاریخچه</p>
            <p className="text-[9px]" style={{ color: "var(--text-3)" }}>مشاهده فاکتورها</p>
          </button>
        </div>

        {stats?.total === 0 && (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm" style={{ color: "var(--text-2)" }}>هنوز فاکتوری ثبت نشده</p>
            <button onClick={() => navigate("/create-invoice")} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all" style={{ background: "var(--accent)" }}>ساخت اولین فاکتور</button>
          </div>
        )}
      </main>
    </div>
  );
};
export default ReportsPage;
