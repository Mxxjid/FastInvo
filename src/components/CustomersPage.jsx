import React, { useState, useEffect } from "react";
import { ArrowRight, Plus, Search, User, Phone, MapPin, Trash2, Edit3, X, Loader2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from "../services/db";

const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModal, setIsModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  const load = async () => { try { setCustomers((await getCustomers()).sort((a, b) => b.id - a.id)); } catch (e) { console.error(e); } finally { setIsLoading(false); } };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", phone: "", email: "", address: "", notes: "" }); setIsModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name || "", phone: c.phone || "", email: c.email || "", address: c.address || "", notes: c.notes || "" }); setIsModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try { if (editing) await updateCustomer(editing.id, form); else await addCustomer(form); setIsModal(false); load(); } catch { alert("خطا در ذخیره"); }
  };
  const handleDelete = async (id, e) => { e.stopPropagation(); if (window.confirm("حذف این مشتری؟")) { await deleteCustomer(id); load(); } };

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  if (isLoading) return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: "var(--accent)" }} size={36} /></div>;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-1)] font-sans" dir="rtl">
      <header className="sticky top-0 z-30 glass" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-2)] active:scale-90 transition-all"><ArrowRight size={20} /></button>
            <h1 className="text-base font-black text-[var(--text-1)]">مدیریت مشتریان</h1>
          </div>
          <button onClick={openAdd} className="p-2 rounded-xl text-white active:scale-90 transition-all" style={{ background: "var(--accent)" }}><Plus size={18} /></button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-2">
        <div className="relative">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input type="text" placeholder="جستجوی مشتری..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl pr-10 pl-4 py-3 text-sm outline-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 space-y-2 page-pad">
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <UserPlus size={36} className="mx-auto" style={{ color: "var(--text-3)" }} />
            <p className="text-[var(--text-2)] font-bold">{search ? "نتیجه‌ای یافت نشد" : "مشتری‌ای ثبت نشده"}</p>
          </div>
        ) : filtered.map(c => (
          <div key={c.id} className="card rounded-2xl p-3.5 active:scale-[0.98] transition-all" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex items-start justify-between">
              <div className="flex gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--purple-muted)" }}><User size={18} style={{ color: "var(--purple)" }} /></div>
                <div className="space-y-1">
                  <h3 className="font-black text-sm text-[var(--text-1)]">{c.name}</h3>
                  {c.phone && <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: "var(--text-3)" }}><Phone size={10} /><span dir="ltr">{c.phone}</span></div>}
                  {c.address && <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-3)" }}><MapPin size={10} /><span className="line-clamp-1">{c.address}</span></div>}
                </div>
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "var(--text-3)" }}><Edit3 size={14} /></button>
                <button onClick={e => handleDelete(c.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "var(--text-3)" }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {isModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModal(false)} />
          <div className="relative w-full max-w-2xl rounded-t-3xl p-5 animate-slide-up" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border-default)", paddingBottom: "calc(24px + var(--safe-bottom))" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "var(--border-default)" }} />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-[var(--text-1)]">{editing ? "ویرایش مشتری" : "افزودن مشتری"}</h2>
              <button onClick={() => setIsModal(false)} className="p-1.5 rounded-lg" style={{ background: "var(--bg-elevated)", color: "var(--text-2)" }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "نام مشتری *", key: "name", type: "text", ph: "نام و نام خانوادگی" },
                { label: "شماره تماس", key: "phone", type: "tel", ph: "0912XXXXXXX" },
                { label: "ایمیل", key: "email", type: "email", ph: "email@example.com" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5" style={{ color: "var(--text-3)" }}>{f.label}</label>
                  <input type={f.type} dir={f.type === "tel" || f.type === "email" ? "ltr" : "rtl"} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none text-left font-mono" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
                </div>
              ))}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5" style={{ color: "var(--text-3)" }}>آدرس</label>
                <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="آدرس کامل..." rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5" style={{ color: "var(--text-3)" }}>یادداشت</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="توضیحات..." rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
              </div>
              <button onClick={handleSave} disabled={!form.name.trim()} className="w-full py-3.5 rounded-xl font-black text-sm text-white active:scale-[0.97] transition-all disabled:opacity-40" style={{ background: "var(--accent)" }}>
                {editing ? "ذخیره تغییرات" : "افزودن مشتری"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CustomersPage;
