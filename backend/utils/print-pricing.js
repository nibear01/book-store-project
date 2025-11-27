import { __printDefaults as DEFAULT_PRINT_CONFIG } from "../controllers/setting-controllers.js";
import Setting from "../models/setting-model.js";

// Cached settings retrieval (reuse logic similar to controllers without Express)
let cached = null;
let expires = 0;
const TTL = 60 * 1000;

export async function getPrintPricingConfig() {
  const now = Date.now();
  if (cached && expires > now) return cached;
  const doc = await Setting.findOne({ key: "printPricingConfig" }).lean();
  const v = doc?.value || DEFAULT_PRINT_CONFIG;
  // normalize minimal
  cached = {
    basePerPage: Number(v?.basePerPage) >= 0 ? Number(v.basePerPage) : DEFAULT_PRINT_CONFIG.basePerPage,
    multipliers: {
      quality: {
        economy: Number(v?.multipliers?.quality?.economy) || DEFAULT_PRINT_CONFIG.multipliers.quality.economy,
        standard: Number(v?.multipliers?.quality?.standard) || DEFAULT_PRINT_CONFIG.multipliers.quality.standard,
        premium: Number(v?.multipliers?.quality?.premium) || DEFAULT_PRINT_CONFIG.multipliers.quality.premium,
      },
      side: {
        single: Number(v?.multipliers?.side?.single) || DEFAULT_PRINT_CONFIG.multipliers.side.single,
        double: Number(v?.multipliers?.side?.double) || DEFAULT_PRINT_CONFIG.multipliers.side.double,
      },
      size: {
        A5: Number(v?.multipliers?.size?.A5) || DEFAULT_PRINT_CONFIG.multipliers.size.A5,
        A4: Number(v?.multipliers?.size?.A4) || DEFAULT_PRINT_CONFIG.multipliers.size.A4,
        A3: Number(v?.multipliers?.size?.A3) || DEFAULT_PRINT_CONFIG.multipliers.size.A3,
      },
      color: {
        bw: Number(v?.multipliers?.color?.bw) || DEFAULT_PRINT_CONFIG.multipliers.color.bw,
        color: Number(v?.multipliers?.color?.color) || DEFAULT_PRINT_CONFIG.multipliers.color.color,
      },
    },
    margin: {
      type: v?.margin?.type === "flat" ? "flat" : "percent",
      value: Number(v?.margin?.value) || DEFAULT_PRINT_CONFIG.margin.value,
    },
    mode: v?.mode === "relative" ? "relative" : "derived",
  };
  expires = now + TTL;
  return cached;
}

export function computePrintPrice({ book, variant, cfg }) {
  const pages = Number(book?.pages) || 0;
  const baseAdminPrice = Number(book?.price) || 0;
  const q = cfg.multipliers.quality[variant?.paperQuality] ?? 1;
  const s = cfg.multipliers.side[variant?.printSide] ?? 1;
  const z = cfg.multipliers.size[variant?.paperSize] ?? 1;
  const c = cfg.multipliers.color[variant?.colorMode] ?? 1;

  if (cfg.mode === "relative") {
    // Default state baseline
    const dq = cfg.multipliers.quality.economy ?? 1;
    const ds = cfg.multipliers.side.single ?? 1;
    const dz = cfg.multipliers.size.A4 ?? 1;
    const dc = cfg.multipliers.color.bw ?? 1;
    const baseline = dq * ds * dz * dc || 1;
    const current = q * s * z * c || 1;
    const ratio = baseline > 0 ? current / baseline : 1;
    const adjusted = Number((baseAdminPrice * ratio).toFixed(2));
    // In relative mode we treat admin price as final baseline; breakdown not exact
    return {
      contentPrice: baseAdminPrice,
      printCost: null,
      margin: null,
      baseCost: null,
      finalPrice: adjusted,
    };
  }

  // derived mode (default): compute content + printing + margin
  const printCost = Number((cfg.basePerPage * pages * q * s * z * c).toFixed(2));
  const baseCost = Number((baseAdminPrice + printCost).toFixed(2));
  const margin = cfg.margin.type === "flat"
    ? Number(cfg.margin.value)
    : Number((baseCost * (cfg.margin.value / 100)).toFixed(2));
  const finalPrice = Number((baseCost + (Number.isFinite(margin) ? margin : 0)).toFixed(2));

  return {
    contentPrice: baseAdminPrice,
    printCost,
    margin: Number.isFinite(margin) ? margin : 0,
    baseCost,
    finalPrice,
  };
}
