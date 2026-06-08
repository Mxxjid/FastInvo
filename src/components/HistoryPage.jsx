import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Calendar, Trash2, Hash, Loader2, Search, CheckCircle2, XCircle } from "lucide-react";
import { getInvoices, deleteInvoice as delInv, updateInvoice } from "../services/db";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try { setInvoices((await getInvoices()).sort((a, b) => b.id - a.id)); }
    catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("آیا از حذف این فاکتور مطمئن هستید؟")) {
      try { await delInv(id); setInvoices(p => p.filter(i => i.id !== id)); } catch { alert("خطا در حذف"); }
    }
  };

  const toggleStatus = async (inv, e) => {
    e.stopPropagation();
    const ns = inv.status === "paid" ? "unpaid" : "paid";
    try { await updateInvoice(inv.id, { ...inv, status: ns }); setInvoices(p => p.map(i => i.id === inv.id ? { ...i, status: ns } : i)); }
    catch { alert("خطا در تغییر وضعیت"); }
  };

  const filtered = invoices.filter(inv => {
    const ms = inv.clientName?.toLowerCase().includes(search.toLowerCase()) || inv.number?.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "all" || inv.status === filter;
    return ms && mf;
  });

  const badge = (s) => {
    const map = { paid: { label: "پرداخت شده", bg: "var(--success-muted)", text: "var(--success)" }, unpaid: { label: "پرداخت نشده", bg: "var(--danger-muted)", text: "var(--danger)" } };
    const b = map[s] || { label: "پیش‌نویس", bg: "var(--bg-elevated)", text: "var(--text-3)" };
    return <span className="text-[8px] font-bold px-2 py-0.5 rounded-md" style={{ background: b.bg, color: b.text }}>{b.label}</span>;
  };

  if (isLoading) return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: "var(--accent)" }} size={36} /></div>;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-1)] font-sans" dir="rtl">
      <header className="sticky top-0 z-30 glass" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-2)] active:scale-90 transition-all"><ArrowRight size={20} /></button>
            <h1 className="text-base font-black text-[var(--text-1)]">تاریخچه فاکتورها</h1>
          </div>
          <span className="text-[9px] font-bold px-2.5 py-1 rounded-full" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>{filtered.length} فاکتور</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-2 space-y-2.5">
        <div className="relative">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input type="text" placeholder="جستجو بر اساس نام مشتری یا شماره..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl pr-10 pl-4 py-3 text-sm outline-none transition-all" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
        </div>
        <div className="flex gap-2">
          {[{ k: "all", l: "همه" }, { k: "paid", l: "پرداخت شده" }, { k: "unpaid", l: "پرداخت نشده" }].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)} className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              style={{ background: filter === f.k ? "var(--accent)" : "var(--bg-card)", color: filter === f.k ? "#fff" : "var(--text-2)", border: "1px solid", borderColor: filter === f.k ? "var(--accent)" : "var(--border-subtle)" }}>{f.l}</button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 space-y-2.5 page-pad">
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-5">
            <FileText size={36} className="mx-auto" style={{ color: "var(--text-3)" }} />
            <p className="text-[var(--text-2)] font-bold">{search || filter !== "all" ? "نتیجه‌ای یافت نشد" : "فاکتوری یافت نشد"}</p>
            <button onClick={() => navigate("/create-invoice")} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white active:scale-95 transition-all" style={{ background: "var(--accent)" }}>ساخت اولین فاکتور</button>
          </div>
        ) : filtered.map(inv => (
          <div key={inv.id} onClick={() => navigate(`/edit/${inv.id}`)} className="card rounded-2xl p-3.5 active:scale-[0.98] transition-all cursor-pointer" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-muted)" }}>
                  <FileText size={18} style={{ color: "var(--accent)" }} />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-[var(--text-1)]">{inv.clientName || "بدون نام"}</h3>
                    {badge(inv.status)}
                  </div>
                  <div className="flex items-center gap-2.5 text-[9px] font-medium" style={{ color: "var(--text-3)" }}>
                    <span className="flex items-center gap-1"><Calendar size={10} />{inv.date}</span>
                    <span className="flex items-center gap-1"><Hash size={10} />{inv.number}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5">
                <button onClick={e => toggleStatus(inv, e)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all" style={{ color: inv.status === "paid" ? "var(--success)" : "var(--text-3)" }}>
                  {inv.status === "paid" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </button>
                <button onClick={e => handleDelete(inv.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all" style={{ color: "var(--text-3)" }}><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="rounded-xl p-3 flex justify-between items-end" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <div>
                <span className="text-[8px] font-bold uppercase block" style={{ color: "var(--text-3)" }}>مبلغ قابل پرداخت</span>
                <p className="font-black text-base font-mono" style={{ color: "var(--success)" }}>{(inv.totals?.grandTotal || 0).toLocaleString()}<span className="text-[9px] mr-1" style={{ color: "var(--text-3)" }}>ریال</span></p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--bg-elevated)", color: "var(--text-3)" }}>{inv.items?.length || 0} قلم</span>
                {inv.isProforma && <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ background: "var(--purple-muted)", color: "var(--purple)" }}>پیش‌فاکتور</span>}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};
export default HistoryPage;
