import Dexie from "dexie";

// Shared Dexie instance for the entire app
const db = new Dexie("InvoiceDB");

db.version(1).stores({
  settings: "id",
  invoices: "++id, clientName, date, status, createdAt, updatedAt",
  customers: "++id, name, phone, createdAt",
  products: "++id, name, price, unit, createdAt",
});

// Settings helpers
export const getSettings = async (id) => {
  return await db.settings.get(id);
};

export const saveSettings = async (data) => {
  return await db.settings.put(data);
};

// Invoice helpers
export const getInvoices = async () => {
  return await db.invoices.toArray();
};

export const getInvoice = async (id) => {
  return await db.invoices.get(Number(id));
};

export const addInvoice = async (data) => {
  return await db.invoices.add(data);
};

export const updateInvoice = async (id, data) => {
  return await db.invoices.update(Number(id), data);
};

export const deleteInvoice = async (id) => {
  return await db.invoices.delete(Number(id));
};

export const getNextInvoiceNumber = async () => {
  const all = await db.invoices.toArray();
  if (all.length === 0) return "INV-0001";
  const sorted = all.sort((a, b) => b.id - a.id);
  const last = sorted[0];
  const match = last.number?.match(/(\d+)/);
  if (match) {
    const lastNum = parseInt(match[1], 10);
    return `INV-${String(lastNum + 1).padStart(4, "0")}`;
  }
  return "INV-0001";
};

// Customer helpers
export const getCustomers = async () => {
  return await db.customers.toArray();
};

export const addCustomer = async (data) => {
  return await db.customers.add({ ...data, createdAt: new Date().toISOString() });
};

export const updateCustomer = async (id, data) => {
  return await db.customers.update(Number(id), data);
};

export const deleteCustomer = async (id) => {
  return await db.customers.delete(Number(id));
};

// Product helpers
export const getProducts = async () => {
  return await db.products.toArray();
};

export const addProduct = async (data) => {
  return await db.products.add({ ...data, createdAt: new Date().toISOString() });
};

export const updateProduct = async (id, data) => {
  return await db.products.update(Number(id), data);
};

export const deleteProduct = async (id) => {
  return await db.products.delete(Number(id));
};

// Stats helpers
// فقط فاکتورهای فروش (نه پیش‌فاکتور) در آمار مالی حساب می‌شوند
export const getInvoiceStats = async () => {
  const allInvoices = await db.invoices.toArray();

  // همه فاکتورها (شامل پیش‌فاکتور)
  const total = allInvoices.length;

  // فقط فاکتورهای فروش (isProforma === false یا undefined)
  const salesInvoices = allInvoices.filter((i) => !i.isProforma);

  // پیش‌فاکتورها جدا
  const proformaInvoices = allInvoices.filter((i) => i.isProforma === true);

  // وضعیت‌ها فقط روی فاکتورهای فروش
  const paid = salesInvoices.filter((i) => i.status === "paid").length;
  const unpaid = salesInvoices.filter(
    (i) => i.status === "unpaid" || !i.status
  ).length;
  const draft = salesInvoices.filter((i) => i.status === "draft").length;

  // درآمد: فقط فاکتورهای فروش پرداخت شده
  const totalRevenue = salesInvoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + (i.totals?.grandTotal || 0), 0);

  // مبلغ در انتظار پرداخت: فقط فاکتورهای فروش پرداخت نشده (بدون پیش‌فاکتور)
  const pendingAmount = salesInvoices
    .filter((i) => i.status === "unpaid" || !i.status)
    .reduce((sum, i) => sum + (i.totals?.grandTotal || 0), 0);

  return {
    total,
    totalSales: salesInvoices.length,
    totalProforma: proformaInvoices.length,
    paid,
    unpaid,
    draft,
    totalRevenue,
    pendingAmount,
  };
};

// Export all data
export const exportAllData = async () => {
  const settings = await db.settings.toArray();
  const invoices = await db.invoices.toArray();
  const customers = await db.customers.toArray();
  const products = await db.products.toArray();
  return { settings, invoices, customers, products, exportedAt: new Date().toISOString() };
};

// Import data
export const importAllData = async (data) => {
  if (data.settings) await db.settings.bulkPut(data.settings);
  if (data.invoices) await db.invoices.bulkPut(data.invoices);
  if (data.customers) await db.customers.bulkPut(data.customers);
  if (data.products) await db.products.bulkPut(data.products);
};

export default db;
