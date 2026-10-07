// Shared pricing constants & utility (no React components)
export const QUALITIES = [
  { id: "economy", label: "Economy", note: "Budget, lighter stock", mult: 1.0 },
  { id: "standard", label: "Standard", note: "Everyday quality", mult: 1.15 },
  {
    id: "premium",
    label: "Premium",
    note: "Heavier, smooth finish",
    mult: 1.3,
  },
];

export const SIDES = [
  {
    id: "single",
    label: "Single-Sided",
    note: "Printed on one side",
    mult: 1.0,
  },
  {
    id: "double",
    label: "Double-Sided",
    note: "Front & back print",
    mult: 0.92,
  },
];

export const SIZES = [
  { id: "A5", label: "A5", note: "Compact", mult: 0.85 },
  { id: "A4", label: "A4", note: "Standard", mult: 1.0 },
  { id: "A3", label: "A3", note: "Large format", mult: 1.25 },
];

export const COLOR = [
  { id: "bw", label: "B/W", note: "Black & white", mult: 1.0 },
  { id: "color", label: "Full Color", note: "Vivid color print", mult: 1.4 },
];

// Legacy local compute (kept for fallback): scales only basePrice using local constants
export function computeConfiguredPrice(basePrice, cfg) {
  const q = QUALITIES.find((q) => q.id === cfg.paperQuality)?.mult || 1;
  const s = SIDES.find((s) => s.id === cfg.printSide)?.mult || 1;
  const z = SIZES.find((z) => z.id === cfg.paperSize)?.mult || 1;
  const c = COLOR.find((c) => c.id === cfg.colorMode)?.mult || 1;
  return Number((basePrice * q * s * z * c).toFixed(2));
}

// New compute using backend settings: final price = (baseContentPrice + perPageCost * pages * multipliers) + margin
export function computeFinalConfiguredPrice({ baseContentPrice = 0, pages = 0, cfg, settings }) {
  if (!settings) {
    // Fallback to legacy behavior
    return {
      price: computeConfiguredPrice(baseContentPrice, cfg),
      breakdown: {
        contentPrice: baseContentPrice,
        printCost: 0,
        margin: 0,
        baseCost: baseContentPrice,
        finalPrice: computeConfiguredPrice(baseContentPrice, cfg),
      },
    };
  }
  const m = settings?.multipliers || {};
  const q = m?.quality?.[cfg?.paperQuality] ?? 1;
  const s = m?.side?.[cfg?.printSide] ?? 1;
  const z = m?.size?.[cfg?.paperSize] ?? 1;
  const c = m?.color?.[cfg?.colorMode] ?? 1;
  if (settings?.mode === 'relative') {
    // Adjust from admin-set baseContentPrice assuming it's the default configuration (defaultPrintState)
    const dq = m?.quality?.[defaultPrintState.paperQuality] ?? 1;
    const ds = m?.side?.[defaultPrintState.printSide] ?? 1;
    const dz = m?.size?.[defaultPrintState.paperSize] ?? 1;
    const dc = m?.color?.[defaultPrintState.colorMode] ?? 1;
    const baseline = dq * ds * dz * dc || 1;
    const current = q * s * z * c || 1;
    const ratio = baseline > 0 ? current / baseline : 1;
    const final = Number((Number(baseContentPrice) * ratio).toFixed(2));
    return {
      price: final,
      breakdown: {
        contentPrice: Number(baseContentPrice) || 0,
        printCost: null,
        margin: null,
        baseCost: null,
        finalPrice: final,
      },
    };
  }

  // derived: ignore admin-provided baseContentPrice and use global contentFee
  const contentFee = Number(settings?.contentFee) >= 0 ? Number(settings.contentFee) : 0;
  const perPage = Number(settings?.basePerPage) >= 0 ? Number(settings.basePerPage) : 0;
  const pc = Number((perPage * (Number(pages) || 0) * q * s * z * c).toFixed(2));
  const baseCost = Number((contentFee + pc).toFixed(2));
  const marginType = settings?.margin?.type === 'flat' ? 'flat' : 'percent';
  const mval = Number(settings?.margin?.value) || 0;
  const margin = marginType === 'flat' ? mval : Number((baseCost * (mval / 100)).toFixed(2));
  const final = Number((baseCost + (Number.isFinite(margin) ? margin : 0)).toFixed(2));
  return { price: final, breakdown: { contentPrice: contentFee, printCost: pc, margin: Number.isFinite(margin) ? margin : 0, baseCost, finalPrice: final } };
}

export const defaultPrintState = {
  paperQuality: QUALITIES[0].id,
  printSide: SIDES[0].id,
  paperSize: SIZES[1].id,
  colorMode: COLOR[0].id,
};

/**
 * The price a shopper pays for a book — the single rule used by cards, deals and the book page.
 * Mirrors the backend's buildFinalUnitPrice (backend/utils/print-pricing.js), which the cart and orders charge.
 *  - derived mode: contentFee + per-page print cost + margin (book.price is not used)
 *  - relative mode: book.price scaled by the chosen print options
 *  - a sale counts only when it is below the regular price; in derived mode the
 *    print-option difference is added on top of the sale price
 * Returns { price, compareAt (regular price when on sale, else null), breakdown, onSale }.
 */
export function getBookPrice(book, settings, variant = defaultPrintState) {
  const cfg = variant || defaultPrintState;
  const pages = Number(book?.pages) || 0;
  const regular = Number(book?.price) || 0;
  const sale = Number(book?.sale_price);
  const saleSet = !!book?.is_on_sale && book?.sale_price != null && Number.isFinite(sale) && sale >= 0;
  const round2 = (n) => Number(Number(n).toFixed(2));

  if (!settings) {
    const onSale = saleSet && sale < regular;
    return { price: onSale ? sale : regular, compareAt: onSale ? regular : null, breakdown: null, onSale };
  }

  if (settings.mode === "derived") {
    const current = computeFinalConfiguredPrice({ baseContentPrice: 0, pages, cfg, settings });
    const base = computeFinalConfiguredPrice({ baseContentPrice: 0, pages, cfg: defaultPrintState, settings });
    const onSale = saleSet && sale < base.price;
    const price = onSale ? round2(sale + (current.price - base.price)) : current.price;
    return {
      price,
      compareAt: onSale ? current.price : null,
      breakdown: { ...current.breakdown, finalPrice: price },
      onSale,
    };
  }

  // relative
  const current = computeFinalConfiguredPrice({ baseContentPrice: regular, pages, cfg, settings });
  const onSale = saleSet && sale < regular;
  if (!onSale) return { price: current.price, compareAt: null, breakdown: current.breakdown, onSale };
  const saleCurrent = computeFinalConfiguredPrice({ baseContentPrice: sale, pages, cfg, settings });
  return { price: saleCurrent.price, compareAt: current.price, breakdown: saleCurrent.breakdown, onSale };
}
