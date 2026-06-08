/**
 * Image optimization service for mobile PDF generation
 * Compresses and resizes images to prevent memory issues on mobile devices
 */

// Compress a base64 image to reduce size
export const compressImage = (base64, maxWidth = 200, quality = 0.6) => {
  return new Promise((resolve, reject) => {
    // If not a data URL, return as-is
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

        // Scale down if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Use JPEG for smaller size (no transparency needed for logos/signatures)
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed);
      } catch (e) {
        // If compression fails, return original
        console.warn("Image compression failed, using original:", e);
        resolve(base64);
      }
    };

    img.onerror = () => {
      // If image can't load, return empty to prevent PDF crash
      console.warn("Image failed to load, skipping");
      resolve(null);
    };

    img.src = base64;
  });
};

// Prepare seller info for PDF - compress images
export const prepareSellerInfoForPDF = async (sellerInfo) => {
  if (!sellerInfo) return {};

  const result = { ...sellerInfo };

  if (result.logo) {
    try {
      result.logo = await compressImage(result.logo, 150, 0.5);
    } catch {
      result.logo = null;
    }
  }

  if (result.signature) {
    try {
      result.signature = await compressImage(result.signature, 120, 0.5);
    } catch {
      result.signature = null;
    }
  }

  return result;
};

// Check if running on mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Get memory-safe chunk size for mobile
export const getSafeChunkSize = () => {
  return isMobile() ? 50 : 200;
};
