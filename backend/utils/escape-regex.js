// Escape user input so it matches literally inside a RegExp / $regex
export const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
