import React, { useState, useEffect } from "react";
import { ArrowRight, Plus, Search, Package, Trash2, Edit3, X, Loader2, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts, addProduct, updateProduct, deleteProduct } from "../services/db";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModal, setIsModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", unit: "عدد", price: "", category: "" });
  const units = ["عدد", "کیلوگرم", "متر", "لیتر", "بسته", "جعبه", "ساعت", "صفحه"];

  const load = async () => { try { setProducts((await getProducts()).sort((a, b) => b.id - a.id)); } catch (e) { console.error(e); } finally { setIsLoading(false); } };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "", unit: "عدد", price: "", category: "" }); setIsModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name || "", description: p.description || "", unit: p.unit || "عدد", price: p.price?.toString() || "", category: p.category || "" }); setIsModal(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    try { if (editing) await updateProduct(editing.id, { ...form, price: Number(form.price) }); else await addProduct({ ...form, price: Number(form.price) }); setIsModal(false); load(); } catch { alert("خطا در ذخیره"); }
  };
  const handleDelete = async (id, e) => { e.stopPropagation(); if (window.confirm("حذف این محصول؟")) { await deleteProduct(id); load(); } };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));
  const fmtPrice = (v) => v ? Number(v).toLocaleString("fa-IR") : "0";

  if (isLoading) return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: "var(--accent)" }} size={36} /></div>;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-1)] font-sans" dir="rtl">
      <header className="sticky top-0 z-30 glass" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-2)] active:scale-90 transition-all"><ArrowRight size={20} /></button>
            <h1 className="text-base font-black text-[var(--text-1)]">کالا / خدمات</h1>
          </div>
          <button onClick={openAdd} className="p-2 rounded-xl text-white active:scale-90 transition-all" style={{ background: "var(--accent)" }}><Plus size={18} /></button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 pb-2">
        <div className="relative">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input type="text" placeholder="جستجوی کالا یا خدمت..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl pr-10 pl-4 py-3 text-sm outline-none" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 space-y-2 page-pad">
        {filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Tag size={36} className="mx-auto" style={{ color: "var(--text-3)" }} />
            <p className="text-[var(--text-2)] font-bold">{search ? "نتیجه‌ای یافت نشد" : "محصولی ثبت نشده"}</p>
          </div>
        ) : filtered.map(p => (
          <div key={p.id} className="card rounded-2xl p-3.5 active:scale-[0.98] transition-all" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex items-start justify-between">
              <div className="flex gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--success-muted)" }}><Package size={18} style={{ color: "var(--success)" }} /></div>
                <div className="space-y-0.5">
                  <h3 className="font-black text-sm text-[var(--text-1)]">{p.name}</h3>
                  {p.description && <p className="text-[10px] line-clamp-1" style={{ color: "var(--text-3)" }}>{p.description}</p>}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="font-black text-xs font-mono" style={{ color: "var(--success)" }}>{fmtPrice(p.price)}<span className="text-[8px] mr-0.5" style={{ color: "var(--text-3)" }}>ریال</span></span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-3)" }}>{p.unit}</span>
                    {p.category && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--accent-muted)", color: "var(--accent)" }}>{p.category}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "var(--text-3)" }}><Edit3 size={14} /></button>
                <button onClick={e => handleDelete(p.id, e)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "var(--text-3)" }}><Trash2 size={14} /></button>
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
              <h2 className="text-base font-black text-[var(--text-1)]">{editing ? "ویرایش محصول" : "افزودن محصول"}</h2>
              <button onClick={() => setIsModal(false)} className="p-1.5 rounded-lg" style={{ background: "var(--bg-elevated)", color: "var(--text-2)" }}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5" style={{ color: "var(--text-3)" }}>نام کالا / خدمت *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثلاً: طراحی وبسایت"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5" style={{ color: "var(--text-3)" }}>توضیحات</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="توضیحات محصول..." rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5" style={{ color: "var(--text-3)" }}>قیمت (ریال) *</label>
                  <input type="number" dir="ltr" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none text-left font-mono" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5" style={{ color: "var(--text-3)" }}>واحد</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none appearance-none" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }}>
                    {units.map(u => <option key={u} value={u} style={{ background: "var(--bg-card)" }}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5" style={{ color: "var(--text-3)" }}>دسته‌بندی</label>
                <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="مثلاً: خدمات دیجیتال"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
              </div>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.price} className="w-full py-3.5 rounded-xl font-black text-sm text-white active:scale-[0.97] transition-all disabled:opacity-40" style={{ background: "var(--accent)" }}>
                {editing ? "ذخیره تغییرات" : "افزودن محصول"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductsPage;
