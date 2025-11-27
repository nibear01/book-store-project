import { useEffect, useState, useCallback } from "react";

export const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export const useImageUrl = (baseUrl) =>
  useCallback(
    (p) => {
      if (!p) return "";
      const src = Array.isArray(p) ? p[0] : p;
      if (!src) return "";
      if (/^https?:\/\//i.test(src)) return src;
      const base = (baseUrl || "").replace(/\/+$/, "");
      const rel = String(src).replace(/^\/+/, "");
      return base ? `${base}/${rel}` : `/${rel}`;
    },
    [baseUrl]
  );
