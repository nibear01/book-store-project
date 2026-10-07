// URL slug that keeps any script's letters, so Bangla titles get a real slug
// ("আমার সোনার বাংলা" -> "আমার-সোনার-বাংলা") instead of an empty string.
// Latin accents are dropped ("Café" -> "cafe"); \p{M} keeps Bangla vowel signs.
export const slugify = (s = "") =>
  String(s)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export default slugify;
