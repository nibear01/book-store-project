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

export function computeConfiguredPrice(basePrice, cfg) {
  const q = QUALITIES.find((q) => q.id === cfg.paperQuality)?.mult || 1;
  const s = SIDES.find((s) => s.id === cfg.printSide)?.mult || 1;
  const z = SIZES.find((z) => z.id === cfg.paperSize)?.mult || 1;
  const c = COLOR.find((c) => c.id === cfg.colorMode)?.mult || 1;
  return Number((basePrice * q * s * z * c).toFixed(2));
}

export const defaultPrintState = {
  paperQuality: QUALITIES[0].id,
  printSide: SIDES[0].id,
  paperSize: SIZES[1].id,
  colorMode: COLOR[0].id,
};
