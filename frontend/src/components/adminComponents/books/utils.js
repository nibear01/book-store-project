export const isValidISBN = (raw) => {
  const s = String(raw || "")
    .replace(/[^0-9Xx]/g, "")
    .toUpperCase();
  if (s.length === 10) {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      const c = s[i];
      const d = i === 9 && c === "X" ? 10 : Number(c);
      if (!Number.isInteger(d)) return false;
      sum += (10 - i) * d;
    }
    return sum % 11 === 0;
  }
  if (s.length === 13) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const d = Number(s[i]);
      if (!Number.isInteger(d)) return false;
      sum += (i % 2 === 0 ? 1 : 3) * d;
    }
    const check = (10 - (sum % 10)) % 10;
    return check === Number(s[12]);
  }
  return false;
};

export const toGenreArray = (g) =>
  Array.isArray(g)
    ? g.map((s) => String(s).trim()).filter(Boolean)
    : String(g || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  const s = String(v ?? "")
    .trim()
    .toLowerCase();
  if (!s) return false;
  return s === "true" || s === "1" || s === "yes" || s === "y";
};

export const normalizeBook = (b) => ({
  id: b.id || b._id || b.id,
  _id: b._id || b.id,
  title: b.title || "",
  author: b.author || "",
  genre: Array.isArray(b.genre)
    ? b.genre
    : typeof b.genre === "string"
      ? [b.genre]
      : [],
  language: b.language || "",
  cover_image: Array.isArray(b.cover_image)
    ? b.cover_image
    : b.cover_image
      ? [b.cover_image]
      : [],
  file_url: b.file_url || "",
  price: typeof b.price === "number" ? b.price : Number(b.price) || 0,
  stock: typeof b.stock === "number" ? b.stock : Number(b.stock) || 0,
  is_active: toBool(b.is_active),
  is_featured: toBool(b.is_featured),
  meta_description: b.meta_description || "",
  meta_title: b.meta_title || "",
  meta_keywords: Array.isArray(b.meta_keywords)
    ? b.meta_keywords
    : b.meta_keywords || [],
  isbn: b.isbn || "",
  description: b.description || "",
  pages: typeof b.pages === "number" ? b.pages : Number(b.pages) || 0,
  is_on_sale: toBool(b.is_on_sale),
  sale_price:
    typeof b.sale_price === "number"
      ? b.sale_price
      : b.sale_price
        ? Number(b.sale_price)
        : null,
  is_deal_of_the_week: toBool(b.is_deal_of_the_week),
  deal_start: b.deal_start || null,
  deal_end: b.deal_end || null,
  isPrintOnDemand: toBool(b.isPrintOnDemand), // added
});
