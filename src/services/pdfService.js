import React from "react";
import { pdf, Font } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { isMobile } from "./imageOptimizer";

/**
 * PDF Generation Service
 * Handles font loading, image validation, and mobile compatibility.
 */

// ── Validate image source ──────────────────────────────────────────
// @react-pdf/renderer Image component only supports:
//   - data:image/... base64 URLs
//   - http:// or https:// URLs
// Anything else will crash the PDF renderer.
const isValidImageSrc = (src) => {
  if (!src || typeof src !== "string") return false;
  return (
    src.startsWith("data:image/") ||
    src.startsWith("http://") ||
    src.startsWith("https://")
  );
};

// ── Prepare seller info ────────────────────────────────────────────
// Strip out any invalid image sources so the PDF renderer never
// receives a bad src. Also compress images on mobile.
const prepareSellerInfoForPDF = async (sellerInfo) => {
  if (!sellerInfo) return {};

  const result = { ...sellerInfo };

  // Validate logo
  if (result.logo && !isValidImageSrc(result.logo)) {
    console.warn("Invalid logo image source, removing");
    result.logo = null;
  }

  // Validate signature
  if (result.signature && !isValidImageSrc(result.signature)) {
    console.warn("Invalid signature image source, removing");
    result.signature = null;
  }

  // On mobile, compress images to reduce memory pressure
  if (isMobile()) {
    if (result.logo) {
      try {
        result.logo = await compressImageForMobile(result.logo, 150, 0.5);
      } catch (e) {
        console.warn("Logo compression failed, removing:", e);
        result.logo = null;
      }
    }
    if (result.signature) {
      try {
        result.signature = await compressImageForMobile(result.signature, 120, 0.5);
      } catch (e) {
        console.warn("Signature compression failed, removing:", e);
        result.signature = null;
      }
    }
  }

  return result;
};

// ── Compress image for mobile ──────────────────────────────────────
const compressImageForMobile = (base64, maxWidth = 200, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    if (!base64 || !base64.startsWith("data:")) {
      resolve(base64);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      } catch (e) {
        console.warn("Image compression failed:", e);
        resolve(null);
      }
    };

    img.onerror = () => {
      console.warn("Image failed to load, skipping");
      resolve(null);
    };

    img.src = base64;
  });
};

// ── Wait for fonts ─────────────────────────────────────────────────
const waitForFonts = async (timeoutMs = 10000) => {
  try {
    if (typeof Font !== "undefined" && Font.loading) {
      await Promise.race([
        Font.loading,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("FONT_LOAD_TIMEOUT")), timeoutMs)
        ),
      ]);
    }
  } catch (e) {
    console.warn("Font loading issue:", e);
  }
  // Small delay to ensure font is fully parsed by textkit
  await new Promise((resolve) => setTimeout(resolve, 300));
};

// ── Generate PDF ───────────────────────────────────────────────────
export const generateInvoicePDF = async (
  invoice,
  sellerInfo,
  TemplateComponent
) => {
  const maxRetries = 3;
  let lastError = null;
  let currentSellerInfo = { ...sellerInfo };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Wait for fonts
      await waitForFonts(8000);

      // Validate & compress images
      const optimizedSellerInfo = await prepareSellerInfoForPDF(currentSellerInfo);

      // Create PDF document
      const doc = React.createElement(TemplateComponent, {
        invoice,
        sellerInfo: optimizedSellerInfo,
      });

      // Generate blob with timeout
      const instance = pdf(doc);
      const blob = await Promise.race([
        instance.toBlob(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("PDF_TIMEOUT")), 45000)
        ),
      ]);

      return { blob, success: true };
    } catch (error) {
      lastError = error;
      console.warn(`PDF generation attempt ${attempt + 1} failed:`, error);

      // On first failure, strip ALL images (not just on mobile)
      // The glyph error is often caused by Image component trying
      // to process corrupted or oversized base64 data
      if (attempt === 0) {
        console.warn("Retrying without images...");
        currentSellerInfo = {
          ...currentSellerInfo,
          logo: null,
          signature: null,
        };
      }

      // On second failure, also strip Persian numerals from text
      // (some font files have incomplete glyph coverage)
      if (attempt === 1) {
        console.warn("Retrying with simplified text...");
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  throw lastError || new Error("PDF_GENERATION_FAILED");
};

// ── Download PDF ───────────────────────────────────────────────────
export const downloadPDF = (blob, fileName) => {
  if (isMobile()) {
    const url = URL.createObjectURL(blob);
    try {
      saveAs(blob, fileName);
    } catch {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } else {
    saveAs(blob, fileName);
  }
};

// ── Generate and download in one step ──────────────────────────────
export const generateAndDownloadPDF = async (
  invoice,
  sellerInfo,
  templateComponent
) => {
  const { blob } = await generateInvoicePDF(
    invoice,
    sellerInfo,
    templateComponent
  );
  const fileName = `${invoice.isProforma ? "Proforma" : "Invoice"}-${invoice.clientName || "unknown"}.pdf`;
  downloadPDF(blob, fileName);
  return true;
};
