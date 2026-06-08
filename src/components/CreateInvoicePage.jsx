import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  Save,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  Percent,
  DollarSign,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import InvoicePDF from "./InvoicePDF";
import {
  getSettings,
  getInvoice,
  addInvoice,
  updateInvoice,
  getNextInvoiceNumber,
} from "../services/db";
import { generateAndDownloadPDF } from "../services/pdfService";
import { isMobile } from "../services/imageOptimizer";

const CreateInvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [invoice, setInvoice] = useState({
    number: "",
    date: "",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
    items: [],
    taxPercent: 9,
    overallDiscountType: "percent",
    overallDiscountValue: 0,
    isProforma: false,
    paymentAccount: "",
    paymentDescription: "",
    generalNotes: "",
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    description: "",
    unit: "عدد",
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
  });

  const formatNumber = (val) => {
    if (!val && val !== 0) return "";
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const parseNumber = (val) => Number(val.toString().replace(/,/g, ""));

  useEffect(() => {
    (async () => {
      try {
        const seller = await getSettings("seller_data");
        if (seller) setSellerInfo(seller);
        const nextNumber = await getNextInvoiceNumber();
        if (id) {
          const found = await getInvoice(id);
          if (found) {
            setInvoice(found);
            return;
          }
        }
        setInvoice((prev) => ({
          ...prev,
          number: nextNumber,
          date: new Date().toLocaleDateString("fa-IR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            numberingSystem: "latn",
          }),
        }));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  const totals = useMemo(() => {
    const items = invoice?.items || [];
    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item?.quantity) || 0,
        price = Number(item?.unitPrice) || 0,
        disc = Number(item?.discountPercent) || 0;
      return sum + qty * price * (1 - disc / 100);
    }, 0);
    const discVal = Number(invoice?.overallDiscountValue) || 0;
    const finalDiscount =
      invoice?.overallDiscountType === "percent"
        ? subtotal * (discVal / 100)
        : discVal;
    const tax =
      (subtotal - finalDiscount) * (Number(invoice?.taxPercent || 0) / 100);
    return {
      subtotal,
      finalDiscount,
      tax,
      grandTotal: subtotal - finalDiscount + tax,
    };
  }, [invoice]);

  const handleFinalSubmit = async () => {
    if (!invoice.clientName || (invoice.items || []).length === 0) {
      alert("لطفاً نام مشتری و حداقل یک کالا را وارد کنید.");
      return;
    }
    setIsGenerating(true);
    try {
      const finalData = {
        ...invoice,
        items: (invoice.items || []).map((it) => ({
          ...it,
          quantity: Number(it.quantity) || 0,
          unitPrice: Number(it.unitPrice) || 0,
          discountPercent: Number(it.discountPercent) || 0,
        })),
        totals,
        updatedAt: new Date().toISOString(),
      };
      if (id) await updateInvoice(Number(id), finalData);
      else await addInvoice(finalData);
      await generateAndDownloadPDF(finalData, sellerInfo, InvoicePDF);
      navigate("/history");
    } catch (error) {
      console.error("Submission Error:", error);
      const msg = isMobile() ? "\n\nراه‌حل: لوگو یا امضا را حذف کنید." : "";
      alert(`خطا در ساخت PDF:\n${error.message}${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddItem = () => {
    if (!currentItem.name || currentItem.unitPrice <= 0) return;
    const items = [...(invoice?.items || [])];
    if (editingIndex !== null) items[editingIndex] = currentItem;
    else items.push(currentItem);
    setInvoice({ ...invoice, items });
    setIsModalOpen(false);
    setCurrentItem({
      name: "",
      description: "",
      unit: "عدد",
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
    });
    setEditingIndex(null);
  };

  const inputCls =
    "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all";
  const inputStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-1)",
  };
  const labelCls =
    "text-[9px] font-bold uppercase tracking-widest px-1 block mb-1.5";
  const labelStyle = { color: "var(--text-3)" };
  const cardCls = "card rounded-2xl p-4 space-y-3";
  const cardStyle = { borderColor: "var(--border-subtle)" };

  return (
    <div
      className="min-h-screen bg-[var(--bg-base)] text-[var(--text-1)] font-sans"
      dir="rtl"
    >
      <nav
        className="sticky top-0 z-40 glass"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl active:scale-90 transition-all"
            style={{ background: "var(--bg-card)", color: "var(--text-2)" }}
          >
            <ArrowRight size={20} />
          </button>
          <span className="font-bold text-sm text-[var(--text-1)]">
            {id ? "ویرایش فاکتور" : "صدور فاکتور جدید"}
          </span>
          <div className="w-8" />
        </div>
      </nav>

      <main className="max-w-xl mx-auto px-3 py-5 space-y-4 page-pad">
        {/* Document Type */}
        <div className={cardCls} style={cardStyle}>
          <label className={labelCls} style={labelStyle}>
            نوع سند
          </label>
          <select
            value={invoice.isProforma ? "proforma" : "invoice"}
            onChange={(e) =>
              setInvoice({
                ...invoice,
                isProforma: e.target.value === "proforma",
              })
            }
            className={inputCls}
            style={inputStyle}
          >
            <option value="invoice" style={{ background: "var(--bg-card)" }}>
              فاکتور فروش
            </option>
            <option value="proforma" style={{ background: "var(--bg-card)" }}>
              پیش‌فاکتور
            </option>
          </select>
        </div>

        {/* Number & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className={cardCls} style={cardStyle}>
            <label className={labelCls} style={labelStyle}>
              شماره سند
            </label>
            <input
              dir="ltr"
              className={inputCls}
              style={{
                ...inputStyle,
                fontFamily: "monospace",
                color: "var(--accent)",
              }}
              placeholder="INV-0001"
              value={invoice.number}
              onChange={(e) =>
                setInvoice({ ...invoice, number: e.target.value })
              }
            />
          </div>
          <div className={cardCls} style={cardStyle}>
            <label className={labelCls} style={labelStyle}>
              تاریخ صدور
            </label>
            <input
              type="text"
              dir="ltr"
              inputMode="numeric"
              className={inputCls}
              style={{ ...inputStyle, fontFamily: "monospace" }}
              placeholder="1402/01/01"
              value={invoice.date}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "");
                if (v.length > 8) v = v.slice(0, 8);
                let f = v;
                if (v.length > 4 && v.length <= 6)
                  f = `${v.slice(0, 4)}/${v.slice(4)}`;
                else if (v.length > 6)
                  f = `${v.slice(0, 4)}/${v.slice(4, 6)}/${v.slice(6)}`;
                setInvoice({ ...invoice, date: f });
              }}
            />
          </div>
        </div>

        {/* Client Info */}
        <div className="card rounded-2xl p-4 space-y-2" style={cardStyle}>
          <input
            className="w-full bg-transparent py-3 text-base outline-none border-b text-right"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-1)",
            }}
            placeholder="نام مشتری..."
            value={invoice.clientName}
            onChange={(e) =>
              setInvoice({ ...invoice, clientName: e.target.value })
            }
          />
          <input
            className="w-full bg-transparent py-3 text-sm outline-none border-b font-mono"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--text-2)",
              textAlign: "right",
              unicodeBidi: "plaintext",
            }}
            dir="ltr"
            placeholder="شماره تلفن"
            value={invoice.clientPhone}
            onChange={(e) =>
              setInvoice({ ...invoice, clientPhone: e.target.value })
            }
          />
          <textarea
            className="w-full bg-transparent py-3 text-sm outline-none resize-none"
            style={{ color: "var(--text-2)" }}
            placeholder="آدرس مشتری (اختیاری)..."
            rows="2"
            value={invoice.clientAddress}
            onChange={(e) =>
              setInvoice({ ...invoice, clientAddress: e.target.value })
            }
          />
        </div>

        {/* Payment Info */}
        <div className="card rounded-2xl p-4 space-y-3" style={cardStyle}>
          <div>
            <label className={labelCls} style={labelStyle}>
              شماره حساب / کارت / شبا
            </label>
            <input
              className={inputCls}
              style={{
                ...inputStyle,
                fontFamily: "monospace",
                textAlign: "right",
                unicodeBidi: "plaintext",
              }}
              dir="ltr"
              placeholder="IR12 3456 7890 ..."
              value={invoice.paymentAccount}
              onChange={(e) =>
                setInvoice({ ...invoice, paymentAccount: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>
              توضیحات پرداخت
            </label>
            <textarea
              className={inputCls}
              style={{ ...inputStyle, resize: "none", minHeight: 70 }}
              placeholder="مهلت پرداخت، نحوه واریز..."
              value={invoice.paymentDescription}
              onChange={(e) =>
                setInvoice({ ...invoice, paymentDescription: e.target.value })
              }
            />
          </div>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h2
              className="font-bold text-[10px] uppercase tracking-widest"
              style={{ color: "var(--text-2)" }}
            >
              اقلام فاکتور ({invoice.items?.length || 0})
            </h2>
            <button
              onClick={() => {
                setEditingIndex(null);
                setIsModalOpen(true);
              }}
              className="font-bold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              style={{
                background: "var(--accent-muted)",
                color: "var(--accent)",
              }}
            >
              + افزودن ردیف
            </button>
          </div>
          {(invoice.items || []).map((item, idx) => (
            <div
              key={idx}
              className="card rounded-2xl p-3.5 flex justify-between items-center"
              style={cardStyle}
            >
              <div>
                <div className="font-bold text-sm text-[var(--text-1)]">
                  {item.name}
                </div>
                <div
                  className="text-[9px] font-mono"
                  style={{ color: "var(--text-3)" }}
                >
                  {Number(item.quantity) || 0} {item.unit} ×{" "}
                  {formatNumber(item.unitPrice)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="font-mono font-bold text-sm"
                  style={{ color: "var(--success)" }}
                >
                  {formatNumber(
                    (Number(item.quantity) || 0) *
                      (Number(item.unitPrice) || 0) *
                      (1 - (Number(item.discountPercent) || 0) / 100),
                  )}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingIndex(idx);
                      setCurrentItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg"
                    style={{ color: "var(--text-3)" }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setInvoice({
                        ...invoice,
                        items: invoice.items.filter((_, i) => i !== idx),
                      })
                    }
                    className="p-1.5 rounded-lg"
                    style={{ color: "var(--text-3)" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="card rounded-2xl p-4" style={cardStyle}>
          <label className={labelCls} style={labelStyle}>
            یادداشت / توضیحات فاکتور
          </label>
          <textarea
            className={inputCls}
            style={{ ...inputStyle, resize: "none", minHeight: 80 }}
            placeholder="شرایط فروش، ضمانت، زمان تحویل..."
            value={invoice.generalNotes}
            onChange={(e) =>
              setInvoice({ ...invoice, generalNotes: e.target.value })
            }
          />
        </div>

        {/* Financial Summary */}
        <div className="card rounded-2xl p-4 space-y-4" style={cardStyle}>
          <div>
            <label className={labelCls} style={labelStyle}>
              تخفیف کلی
            </label>
            <div
              className="flex items-center gap-2 p-2 rounded-xl"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="flex rounded-lg p-0.5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <button
                  onClick={() =>
                    setInvoice({ ...invoice, overallDiscountType: "percent" })
                  }
                  className="p-1.5 px-2.5 rounded-md transition-all"
                  style={{
                    background:
                      invoice.overallDiscountType === "percent"
                        ? "var(--accent)"
                        : "transparent",
                    color:
                      invoice.overallDiscountType === "percent"
                        ? "#fff"
                        : "var(--text-3)",
                  }}
                >
                  <Percent size={12} />
                </button>
                <button
                  onClick={() =>
                    setInvoice({ ...invoice, overallDiscountType: "amount" })
                  }
                  className="p-1.5 px-2.5 rounded-md transition-all"
                  style={{
                    background:
                      invoice.overallDiscountType === "amount"
                        ? "var(--accent)"
                        : "transparent",
                    color:
                      invoice.overallDiscountType === "amount"
                        ? "#fff"
                        : "var(--text-3)",
                  }}
                >
                  <DollarSign size={12} />
                </button>
              </div>
              <input
                type="number"
                className="flex-1 bg-transparent font-mono font-bold outline-none text-left text-base px-2"
                style={{ color: "var(--text-1)" }}
                placeholder="0"
                value={formatNumber(invoice.overallDiscountValue)}
                onChange={(e) =>
                  setInvoice({
                    ...invoice,
                    overallDiscountValue: parseNumber(e.target.value),
                  })
                }
              />
            </div>
          </div>
          <div
            className="flex items-center justify-between p-3 rounded-xl"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="flex items-center gap-1.5"
              style={{ color: "var(--warning)" }}
            >
              <Percent size={14} />
              <span className="text-xs font-bold">مالیات ارزش افزوده</span>
            </div>
            <input
              type="number"
              className="bg-transparent font-mono font-bold outline-none text-left w-16 text-sm"
              style={{ color: "var(--text-1)" }}
              value={invoice.taxPercent}
              onChange={(e) =>
                setInvoice({
                  ...invoice,
                  taxPercent: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        {/* Totals */}
        <div className="card rounded-2xl p-4 space-y-2" style={cardStyle}>
          {[
            { label: "جمع کل", value: totals.subtotal },
            { label: "تخفیف", value: totals.finalDiscount },
            { label: "مالیات", value: totals.tax },
          ].map((r, i) => (
            <div
              key={i}
              className="flex justify-between text-sm"
              style={{ color: "var(--text-2)" }}
            >
              <span>{r.label}</span>
              <span className="font-mono font-bold">
                {formatNumber(r.value)}
              </span>
            </div>
          ))}
          <div
            className="h-px my-1"
            style={{ background: "var(--border-subtle)" }}
          />
          <div className="flex justify-between">
            <span
              className="font-black text-sm"
              style={{ color: "var(--text-1)" }}
            >
              مبلغ قابل پرداخت
            </span>
            <span
              className="font-black text-lg font-mono"
              style={{ color: "var(--success)" }}
            >
              {formatNumber(totals.grandTotal)}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleFinalSubmit}
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl font-black text-sm text-white active:scale-[0.97] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{
            background: "var(--accent)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={18} /> در حال ساخت PDF...
            </>
          ) : (
            <>
              <Save size={18} /> ذخیره و دانلود PDF
            </>
          )}
        </button>
      </main>

      {/* Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div
            className="relative w-full max-w-2xl rounded-t-3xl p-5 animate-slide-up"
            style={{
              background: "var(--bg-card)",
              borderTop: "1px solid var(--border-default)",
              paddingBottom: "calc(24px + var(--safe-bottom))",
            }}
          >
            <div
              className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ background: "var(--border-default)" }}
            />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-[var(--text-1)]">
                {editingIndex !== null ? "ویرایش ردیف" : "افزودن ردیف"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-2)",
                }}
              >
                {/* <X size={16} /> */}
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={labelCls} style={labelStyle}>
                  نام کالا / خدمت *
                </label>
                <input
                  type="text"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  placeholder="شرح کالا یا خدمت"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>
                  توضیحات
                </label>
                <input
                  type="text"
                  value={currentItem.description}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      description: e.target.value,
                    })
                  }
                  placeholder="توضیحات تکمیلی..."
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls} style={labelStyle}>
                    تعداد
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={currentItem.quantity}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: Number(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                    style={{
                      ...inputStyle,
                      textAlign: "left",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>
                    واحد
                  </label>
                  <input
                    type="text"
                    value={currentItem.unit}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, unit: e.target.value })
                    }
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>
                    قیمت واحد *
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={currentItem.unitPrice}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        unitPrice: Number(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                    style={{
                      ...inputStyle,
                      textAlign: "left",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls} style={labelStyle}>
                    تخفیف (%)
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={currentItem.discountPercent}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        discountPercent: Number(e.target.value) || 0,
                      })
                    }
                    className={inputCls}
                    style={{
                      ...inputStyle,
                      textAlign: "left",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddItem}
                    disabled={!currentItem.name || currentItem.unitPrice <= 0}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white active:scale-[0.97] transition-all disabled:opacity-40"
                    style={{ background: "var(--accent)" }}
                  >
                    {editingIndex !== null ? "ویرایش" : "افزودن"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default CreateInvoicePage;
