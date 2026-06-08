import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Save, Building, ImageIcon, Trash2, Loader2 } from "lucide-react";
import { getSettings, saveSettings } from "../services/db";
import { compressImage } from "../services/imageOptimizer";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState({ id: "seller_data", name: "", phone: "", email: "", officePhone: "", address: "", logo: "", signature: "" });

  useEffect(() => {
    (async () => {
      try { const s = await getSettings("seller_data"); if (s) setInfo(s); } catch (e) { console.error(e); } finally { setIsLoading(false); }
    })();
  }, []);

  const handleSave = async () => { try { await saveSettings(info); alert("تنظیمات ذخیره شد"); navigate(-1); } catch { alert("خطا در ذخیره"); } };
  const handleFile = async (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5e6) { alert("حجم فایل نباید بیشتر از ۵ مگابایت باشد"); return; }
    try {
      const r = new FileReader();
      r.onloadend = async () => { const compressed = await compressImage(r.result, field === "logo" ? 300 : 200, 0.6); setInfo(p => ({ ...p, [field]: compressed })); };
      r.readAsDataURL(file);
    } catch { alert("خطا در پردازش تصویر"); }
  };

  if (isLoading) return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center"><Loader2 className="animate-spin" style={{ color: "var(--accent)" }} size={36} /></div>;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-1)] font-sans" dir="rtl">
      <header className="sticky top-0 z-30 glass" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-[var(--bg-card)] text-[var(--text-2)] active:scale-90 transition-all"><ArrowRight size={20} /></button>
            <h1 className="text-base font-black text-[var(--text-1)]">تنظیمات فروشنده</h1>
          </div>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-white font-bold text-xs active:scale-95 transition-all" style={{ background: "var(--accent)" }}>
            <Save size={14} /> ذخیره
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 page-pad">
        {/* Business Info */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1"><Building size={16} style={{ color: "var(--text-2)" }} /><h2 className="font-black text-xs uppercase tracking-widest" style={{ color: "var(--text-2)" }}>اطلاعات کسب و کار</h2></div>
          <div className="card rounded-2xl p-4 space-y-3" style={{ borderColor: "var(--border-subtle)" }}>
            {[
              { label: "نام فروشگاه / شخص", key: "name", ph: "مثلاً: شرکت بازرگانی آریا" },
              { label: "موبایل", key: "phone", ph: "0912XXXXXXX", dir: "ltr" },
              { label: "تلفن دفتر", key: "officePhone", ph: "021XXXXXXXX", dir: "ltr" },
              { label: "ایمیل", key: "email", ph: "info@company.com", dir: "ltr" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold px-1 block mb-1" style={{ color: "var(--text-3)" }}>{f.label}</label>
                <input type="text" dir={f.dir} name={f.key} value={info[f.key]} onChange={e => setInfo(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)", textAlign: f.dir === "ltr" ? "left" : "right" }} />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold px-1 block mb-1" style={{ color: "var(--text-3)" }}>نشانی کامل</label>
              <textarea name="address" value={info.address} onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} rows={3} placeholder="آدرس دقیق..."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", color: "var(--text-1)" }} />
            </div>
          </div>
        </section>

        {/* Media */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1"><ImageIcon size={16} style={{ color: "var(--text-2)" }} /><h2 className="font-black text-xs uppercase tracking-widest" style={{ color: "var(--text-2)" }}>تصاویر و مستندات</h2></div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { field: "logo", label: "لوگوی فروشگاه" },
              { field: "signature", label: "مهر یا امضا" },
            ].map(item => (
              <div key={item.field} className="card rounded-2xl p-4 text-center space-y-3" style={{ borderColor: "var(--border-subtle)" }}>
                <span className="text-[9px] font-bold uppercase block" style={{ color: "var(--text-3)" }}>{item.label}</span>
                <div className="relative group mx-auto w-full aspect-square rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
                  {info[item.field] ? (
                    <>
                      <img src={info[item.field]} alt="" className="w-full h-full object-contain p-3" />
                      <button onClick={() => setInfo(p => ({ ...p, [item.field]: "" }))} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"><Trash2 size={20} /></button>
                    </>
                  ) : (
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 active:bg-[var(--bg-hover)] transition-colors">
                      <input type="file" accept="image/*" onChange={e => handleFile(e, item.field)} className="hidden" />
                      <div className="p-2 rounded-xl" style={{ background: "var(--bg-elevated)" }}><ImageIcon size={20} style={{ color: "var(--text-3)" }} /></div>
                      <span className="text-[9px] font-bold" style={{ color: "var(--text-3)" }}>آپلود</span>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
export default SettingsPage;
