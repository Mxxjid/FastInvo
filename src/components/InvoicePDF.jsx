import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

// ── Font Registration ──────────────────────────────────────────────
// Vazirmatn loaded from local public/fonts directory.
// We register once and guard against double-registration.
let fontRegistered = false;
if (!fontRegistered) {
  try {
    Font.register({
      family: "Vazirmatn",
      fonts: [
        { src: "/fonts/Vazirmatn-Regular.ttf", fontWeight: 400 },
        { src: "/fonts/Vazirmatn-Bold.ttf", fontWeight: 700 },
      ],
    });
    Font.registerHyphenationCallback((word) => [word]);
    fontRegistered = true;
  } catch (error) {
    console.error("Font registration error:", error);
  }
}

// ── Styles ─────────────────────────────────────────────────────────
// IMPORTANT: @react-pdf/renderer does NOT support "direction: "rtl""
// on the page style — it crashes the textkit bidi engine.
// Instead we use flexDirection: "row-reverse" on every row that
// needs RTL visual order.
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontFamily: "Vazirmatn",
    backgroundColor: "#FFFFFF",
    fontSize: 9,
    color: "#000000",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 12,
    textAlign: "center",
  },

  // ── Header ──
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    borderBottomWidth: 1.5,
    borderBottomColor: "#000",
    paddingBottom: 12,
  },
  logoBox: { width: "25%", alignItems: "flex-end" },
  logoImage: { width: 70, height: 70, objectFit: "contain" },
  brandBox: { width: "50%", alignItems: "center", gap: 2 },
  brandName: { fontSize: 14, fontWeight: 700, color: "#000" },
  brandDetail: { fontSize: 8, color: "#444", textAlign: "center" },
  invoiceInfoBox: { width: "25%", alignItems: "flex-start", gap: 4 },
  invoiceInfoRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
  },
  invoiceInfoLabel: { fontSize: 8 },
  invoiceInfoValue: { fontSize: 9, fontWeight: 700 },

  // ── Buyer ──
  buyerSection: {
    marginBottom: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
  },
  buyerTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
    textAlign: "center",
    borderBottomWidth: 0.5,
    paddingBottom: 3,
  },
  buyerRow: {
    flexDirection: "row-reverse",
    marginBottom: 3,
    flexWrap: "wrap",
  },
  buyerLabel: { fontSize: 9, marginLeft: 4 },
  buyerValue: { fontSize: 10, fontWeight: 700 },
  buyerDetailRow: {
    flexDirection: "row-reverse",
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
    paddingTop: 4,
    flexWrap: "wrap",
  },

  // ── Table ──
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#000",
    padding: 6,
  },
  tableHeaderText: { color: "#fff", textAlign: "center" },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 6,
    alignItems: "center",
  },
  tableCellCenter: { textAlign: "center" },
  itemName: { fontWeight: 700, textAlign: "center" },
  itemDesc: { fontSize: 7, color: "#444", textAlign: "center" },

  // ── Bottom section ──
  bottomSection: {
    flexDirection: "row-reverse",
    marginTop: 18,
    gap: 12,
  },
  paymentSection: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
  },
  paymentTitle: { fontSize: 9, fontWeight: 700, marginBottom: 5, textAlign: "right" },
  paymentAccountRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    width: "100%",
  },
  paymentAccountLabel: { fontSize: 9, fontWeight: 700 },
  paymentAccountValue: { fontSize: 9, textAlign: "left" },
  paymentDesc: {
    fontSize: 8,
    lineHeight: 1.4,
    borderTopWidth: 0.5,
    paddingTop: 4,
    borderStyle: "dashed",
    textAlign: "right",
  },

  // ── Summary ──
  summaryBox: {
    width: 200,
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    borderRadius: 4,
    position: "relative",
    paddingBottom: 35,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryTotal: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: "#000",
    padding: 6,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  summaryTotalText: { color: "#fff", fontWeight: 700 },
  summaryTotalAmount: { color: "#fff", fontWeight: 700, fontSize: 11 },
  summaryTotalUnit: { color: "#fff", fontSize: 7, marginRight: 2 },

  // ── Notes ──
  notesSection: {
    marginTop: 14,
    padding: 8,
    borderRightWidth: 3,
    borderRightColor: "#000",
  },
  notesTitle: { fontSize: 9, fontWeight: 700, marginBottom: 2, textAlign: "right" },
  notesText: { fontSize: 8, lineHeight: 1.5, textAlign: "right" },

  // ── Footer ──
  footerSection: { marginTop: "auto", paddingTop: 10 },
  signatureRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    marginTop: 10,
  },
  signatureBox: {
    alignItems: "center",
    width: 150,
    borderTopWidth: 1,
    paddingTop: 5,
  },
  signatureTitle: { fontSize: 9, fontWeight: 700, marginBottom: 5 },
  signaturePlaceholder: { height: 45 },
});

// ── Helpers ────────────────────────────────────────────────────────
const toPersianNumbers = (str) => {
  if (str === undefined || str === null) return "";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return String(str).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

const formatNumber = (num) => {
  if (num === undefined || num === null || num === "") return "۰";
  const formatted = Math.round(num).toLocaleString("en-US");
  return toPersianNumbers(formatted);
};

// ── Safe Image Component ──────────────────────────────────────────
// Wraps the native Image to catch rendering errors.
// If an image fails to render, we show an empty placeholder instead
// of crashing the entire PDF.
const SafeImage = ({ src, style }) => {
  if (!src) return <View style={{ width: style?.width || 70, height: style?.height || 70 }} />;
  // Only render if src looks like a valid data URL or http URL
  const isValidSrc =
    typeof src === "string" &&
    (src.startsWith("data:image/") || src.startsWith("http://") || src.startsWith("https://"));
  if (!isValidSrc) {
    return <View style={{ width: style?.width || 70, height: style?.height || 70 }} />;
  }
  return <Image src={src} style={style} />;
};

// ── Component ──────────────────────────────────────────────────────
const InvoicePDF = ({ invoice, sellerInfo }) => {
  const seller = sellerInfo || {};
  const totals = invoice?.totals || {};
  const isProforma = invoice?.isProforma;
  const items = invoice?.items || [];

  return (
    <Document
      title={`${isProforma ? "Proforma" : "Invoice"}-${invoice?.clientName || ""}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>
          {isProforma ? "پیش‌فاکتور فروش" : "فاکتور فروش"}
        </Text>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.logoBox}>
            <SafeImage src={seller.logo} style={styles.logoImage} />
          </View>

          <View style={styles.brandBox}>
            {seller.name && <Text style={styles.brandName}>{seller.name}</Text>}
            {seller.address && <Text style={styles.brandDetail}>{seller.address}</Text>}
            {seller.officePhone && (
              <Text style={styles.brandDetail}>{toPersianNumbers(seller.officePhone)}</Text>
            )}
            {seller.phone && (
              <Text style={styles.brandDetail}>{toPersianNumbers(seller.phone)}</Text>
            )}
          </View>

          <View style={styles.invoiceInfoBox}>
            <View style={styles.invoiceInfoRow}>
              <Text style={styles.invoiceInfoLabel}>شماره</Text>
              <Text style={styles.invoiceInfoValue}>{invoice?.number || "---"}</Text>
            </View>
            <View style={styles.invoiceInfoRow}>
              <Text style={styles.invoiceInfoLabel}>تاریخ</Text>
              <Text style={styles.invoiceInfoValue}>
                {invoice?.date ? toPersianNumbers(invoice.date) : "---"}
              </Text>
            </View>
          </View>
        </View>

        {/* Buyer */}
        <View style={styles.buyerSection}>
          <Text style={styles.buyerTitle}>مشخصات خریدار</Text>
          <View style={styles.buyerRow}>
            <Text style={styles.buyerLabel}>صاحب حساب:</Text>
            <Text style={styles.buyerValue}>{invoice?.clientName || "---"}</Text>
          </View>
          <View style={styles.buyerDetailRow}>
            <Text style={styles.buyerLabel}>نشانی:</Text>
            <Text style={{ fontSize: 9, flex: 1 }}>{invoice?.clientAddress || "---"}</Text>
            <Text style={styles.buyerLabel}>تلفن:</Text>
            <Text style={styles.buyerValue}>
              {invoice?.clientPhone ? toPersianNumbers(invoice.clientPhone) : "---"}
            </Text>
          </View>
        </View>

        {/* Items Table — RTL order: ردیف | شرح | تعداد | قیمت | تخفیف | جمع */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: "5%" }]}>ردیف</Text>
            <Text style={[styles.tableHeaderText, { width: "35%" }]}>شرح کالا / خدمات</Text>
            <Text style={[styles.tableHeaderText, { width: "12%" }]}>تعداد</Text>
            <Text style={[styles.tableHeaderText, { width: "18%" }]}>قیمت واحد</Text>
            <Text style={[styles.tableHeaderText, { width: "10%" }]}>تخفیف</Text>
            <Text style={[styles.tableHeaderText, { width: "20%" }]}>جمع نهایی</Text>
          </View>

          {items.map((item, i) => {
            const rowSubtotal = (item.quantity || 0) * (item.unitPrice || 0);
            const rowDiscount = rowSubtotal * ((item.discountPercent || 0) / 100);
            const rowTotal = rowSubtotal - rowDiscount;

            return (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableCellCenter, { width: "5%" }]}>
                  {toPersianNumbers(i + 1)}
                </Text>
                <View style={{ width: "35%", alignItems: "center" }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                </View>
                <View
                  style={{
                    width: "12%",
                    flexDirection: "row-reverse",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Text>{formatNumber(item.quantity)}</Text>
                  <Text style={{ fontSize: 7 }}>{item.unit || ""}</Text>
                </View>
                <Text style={[styles.tableCellCenter, { width: "18%" }]}>
                  {formatNumber(item.unitPrice)}
                </Text>
                <Text style={[styles.tableCellCenter, { width: "10%" }]}>
                  {item.discountPercent > 0
                    ? `%${formatNumber(item.discountPercent)}`
                    : "---"}
                </Text>
                <Text style={[styles.tableCellCenter, { width: "20%", fontWeight: 700 }]}>
                  {formatNumber(rowTotal)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.paymentSection}>
            <Text style={styles.paymentTitle}>جزئیات پرداخت</Text>
            {invoice?.paymentAccount && (
              <View style={styles.paymentAccountRow}>
                <Text style={styles.paymentAccountLabel}>حساب/شبا:</Text>
                <Text style={styles.paymentAccountValue}>
                  {toPersianNumbers(invoice.paymentAccount)}
                </Text>
              </View>
            )}
            {invoice?.paymentDescription && (
              <Text style={styles.paymentDesc}>{invoice.paymentDescription}</Text>
            )}
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>{formatNumber(totals?.subtotal)} ریال</Text>
              <Text>جمع کل</Text>
            </View>

            {totals?.finalDiscount ? (
              <View style={styles.summaryRow}>
                <Text>{formatNumber(totals.finalDiscount)} ریال-</Text>
                <Text>تخفیف فاکتور</Text>
              </View>
            ) : null}

            <View style={styles.summaryRow}>
              <Text>{formatNumber(totals?.tax)} ریال+</Text>
              <Text>مالیات ({formatNumber(invoice?.taxPercent)}%)</Text>
            </View>

            <View style={styles.summaryTotal}>
              <View style={{ flexDirection: "row-reverse", alignItems: "baseline" }}>
                <Text style={styles.summaryTotalUnit}>ریال</Text>
                <Text style={styles.summaryTotalAmount}>{formatNumber(totals?.grandTotal)}</Text>
              </View>
              <Text style={styles.summaryTotalText}>قابل پرداخت</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice?.generalNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>توضیحات:</Text>
            <Text style={styles.notesText}>{invoice.generalNotes}</Text>
          </View>
        )}

        {/* Footer / Signatures */}
        <View style={styles.footerSection}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>مهر و امضای فروشنده</Text>
              <SafeImage
                src={seller.signature}
                style={{ width: 90, height: 45, objectFit: "contain" }}
              />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>تایید و امضای خریدار</Text>
              <View style={styles.signaturePlaceholder} />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
