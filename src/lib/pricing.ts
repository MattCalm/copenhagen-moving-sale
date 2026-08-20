export function calculateSavings(retailPrice?: number | null, sellingPrice?: number | null) {
  if (!retailPrice || !sellingPrice || retailPrice <= 0) {
    return null;
  }

  return Math.max(retailPrice - sellingPrice, 0);
}

export function calculateDiscountPercent(retailPrice?: number | null, sellingPrice?: number | null) {
  const savings = calculateSavings(retailPrice, sellingPrice);

  if (savings === null || !retailPrice || retailPrice <= 0) {
    return null;
  }

  return Math.round((savings / retailPrice) * 100);
}

export function formatMoney(value?: number | null, currency = "DKK") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Not listed";
  }

  return new Intl.NumberFormat("en-DK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPublicPrice(value?: number | null, currency = "DKK") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "未填写";
  }

  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);

  return `${amount} ${currency}`;
}

export function getReferencePrice(
  currentRetailPrice?: number | null,
  originalPurchasePrice?: number | null
) {
  if (currentRetailPrice && currentRetailPrice > 0) {
    return currentRetailPrice;
  }

  if (originalPurchasePrice && originalPurchasePrice > 0) {
    return originalPurchasePrice;
  }

  return null;
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Not checked yet";
  }

  return new Intl.DateTimeFormat("en-DK", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
