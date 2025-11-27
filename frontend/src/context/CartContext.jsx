/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { cartAPI } from "../api/cart-api";
import { defaultPrintState } from "../components/bookViewComponents/BookPrintPricing";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const LOCAL_STORAGE_KEY = "cart_items";
const PRICE_OVERRIDES_KEY = "cart_price_overrides"; // persists unit prices per id+variant

function readPriceOverrides() {
  try {
    const raw = localStorage.getItem(PRICE_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePriceOverrides(map) {
  try {
    localStorage.setItem(PRICE_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

function variantKey(variant) {
  if (!variant || typeof variant !== "object") return "default";
  const q = variant.paperQuality || "economy";
  const s = variant.printSide || "single";
  const z = variant.paperSize || "A4";
  const c = variant.colorMode || "bw";
  return `${q}|${s}|${z}|${c}`;
}

function makeItemKey(id, variant) {
  return `${String(id)}|${variantKey(variant)}`;
}

function applyOverrides(items) {
  const overrides = readPriceOverrides();
  return items.map((i) => {
    const key = makeItemKey(i.id, i.variant);
    const ov = overrides[key];
    return ov != null
      ? { ...i, price: Number(ov) }
      : i;
  });
}

function setOverridePrice(id, variant, price) {
  const overrides = readPriceOverrides();
  const key = makeItemKey(id, variant);
  overrides[key] = Number(price);
  writePriceOverrides(overrides);
}

function removeOverridesForId(id) {
  const overrides = readPriceOverrides();
  const prefix = `${String(id)}|`;
  let changed = false;
  for (const k of Object.keys(overrides)) {
    if (k.startsWith(prefix)) {
      delete overrides[k];
      changed = true;
    }
  }
  if (changed) writePriceOverrides(overrides);
}

function clearAllOverrides() {
  try {
    localStorage.removeItem(PRICE_OVERRIDES_KEY);
  } catch {
    // ignore
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART": {
      return { ...state, items: action.items };
    }
    case "ADD_ITEM": {
      const { item } = action;
      const existing = state.items.find((i) => i.id === item.id);
      let nextItems;
      if (existing) {
        nextItems = state.items.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        nextItems = [...state.items, { ...item, quantity: item.quantity || 1 }];
      }
      return { ...state, items: nextItems };
    }
    case "REMOVE_ITEM": {
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    }
    case "UPDATE_QTY": {
      const { id, quantity } = action;
      const q = Math.max(1, quantity);
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity: q } : i
        ),
      };
    }
    case "CLEAR": {
      return { ...state, items: [] };
    }
    default:
      return state;
  }
}

function mapBackendCartToLocalItems(backendCart) {
  const items = backendCart?.items || [];
  return items.map((it) => {
    const book =
      it.book && typeof it.book === "object" ? it.book : { _id: it.book };
    const qty = Number(it.quantity) || 1;
    // Prefer explicit unit price fields, else derive from pricing.finalPrice, else treat provided price as unit price
    let unitPrice;
    if (Number.isFinite(it.unit_price)) {
      unitPrice = Number(it.unit_price);
    } else if (it.pricing && Number.isFinite(it.pricing.finalPrice)) {
      unitPrice = Number(it.pricing.finalPrice);
    } else if (Number.isFinite(it.price)) {
      unitPrice = Number(it.price);
    } else if (Number.isFinite(book.price)) {
      unitPrice = Number(book.price);
    } else {
      unitPrice = 0;
    }
    const variant = it.variant && typeof it.variant === 'object' && (it.variant.paperQuality || it.variant.printSide || it.variant.paperSize || it.variant.colorMode)
      ? {
          paperQuality: it.variant.paperQuality,
          printSide: it.variant.printSide,
          paperSize: it.variant.paperSize,
          colorMode: it.variant.colorMode,
        }
      : { ...defaultPrintState };
    return {
      id: book._id || book.id || it.book, // local key
      title: it.title || book.title || "",
      price: unitPrice,
      quantity: qty,
      configured: !!it.configured,
      variant,
      breakdown: it.pricing || null,
    };
  });
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { isAuthenticated, setIsLoading } = useAuth();
  const isInitialLoadRef = React.useRef(true);

  // Hydrate cart on load based on auth state
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (isAuthenticated) {
        // Load from backend
        try {
          if (setIsLoading && isInitialLoadRef.current) setIsLoading(true);
          const res = await cartAPI.getCart();
          if (!mounted) return;
          let items = mapBackendCartToLocalItems(res.data);
          // Apply client-stored unit price overrides for stability across refresh
          items = applyOverrides(items);
          dispatch({ type: "SET_CART", items });
        } catch {
          // keep current state on error
        } finally {
          if (setIsLoading && isInitialLoadRef.current) setIsLoading(false);
          isInitialLoadRef.current = false;
        }
      } else {
        // Load from localStorage for guests
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed)) {
            dispatch({ type: "SET_CART", items: parsed });
          }
        } catch {
          // ignore corrupt local storage
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, setIsLoading]);

  // Persist guest cart to localStorage on changes
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.items));
      } catch {
        // ignore storage errors
      }
    }
  }, [state.items, isAuthenticated]);

  const addToCart = useCallback(
    async ({ item, quantity = 1, variant }) => {
      const localItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        quantity,
        configured: item.configured,
        variant: item.variant,
        breakdown: item.breakdown,
      };

      if (isAuthenticated) {
        const bookId = item._id || item.bookId || item.id;
        try {
          const res = await cartAPI.addItem({ bookId, quantity, variant });
          const next = mapBackendCartToLocalItems(res.data);
          // Preserve existing unit prices for all previously present items, and override the newly added one with UI-computed price
          const items = next.map((i) => {
            if (String(i.id) === String(bookId)) {
              return {
                ...i,
                price: Number(localItem.price || 0),
                configured: localItem.configured ?? i.configured,
                variant: localItem.variant || i.variant,
                breakdown: localItem.breakdown || i.breakdown,
              };
            }
            const prev = state.items.find((p) => String(p.id) === String(i.id));
            return prev
              ? {
                  ...i,
                  price: Number(prev.price || 0),
                  configured: prev.configured ?? i.configured,
                  variant: prev.variant || i.variant,
                  breakdown: prev.breakdown || i.breakdown,
                }
              : i;
          });
          // Persist override for the just-added item to keep price stable across refresh
          setOverridePrice(bookId, localItem.variant, localItem.price);
          dispatch({ type: "SET_CART", items });
          return;
        } catch {
          // fallback to local update if backend fails
        }
      }

      // Guest cart: set override too
      setOverridePrice(localItem.id, localItem.variant, localItem.price);
      dispatch({ type: "ADD_ITEM", item: localItem });
    },
    [isAuthenticated, state.items]
  );

  const updateQuantity = useCallback(
    async ({ id, quantity }) => {
      if (isAuthenticated) {
        try {
          const res = await cartAPI.updateItem({ bookId: id, quantity });
          const next = mapBackendCartToLocalItems(res.data);
          // Preserve unit prices and variants for items already in state; only quantity should change
          const items = next.map((i) => {
            const prev = state.items.find((p) => String(p.id) === String(i.id));
            return prev
              ? {
                  ...i,
                  price: Number(prev.price || 0),
                  configured: prev.configured ?? i.configured,
                  variant: prev.variant || i.variant,
                  breakdown: prev.breakdown || i.breakdown,
                }
              : i;
          });
          dispatch({ type: "SET_CART", items });
          return;
        } catch {
          // fallback to local update
        }
      }
      dispatch({ type: "UPDATE_QTY", id, quantity });
    },
    [isAuthenticated, state.items]
  );

  const removeItem = useCallback(
    async ({ id }) => {
      if (isAuthenticated) {
        try {
          await cartAPI.removeItem({ bookId: id });
          // Always update UI immediately, even if API call might fail
          dispatch({ type: "REMOVE_ITEM", id });
          removeOverridesForId(id);
          return;
        } catch (error) {
          console.error("Failed to remove item from server:", error);
          // Still remove from UI even if API fails to maintain consistency
          dispatch({ type: "REMOVE_ITEM", id });
          removeOverridesForId(id);
        }
      } else {
        dispatch({ type: "REMOVE_ITEM", id });
        removeOverridesForId(id);
      }
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clear();
        dispatch({ type: "CLEAR" });
        clearAllOverrides();
        return;
      } catch (error) {
        console.error("Failed to clear cart on server:", error);
        // Still clear UI even if API fails
        dispatch({ type: "CLEAR" });
        clearAllOverrides();
      }
    } else {
      dispatch({ type: "CLEAR" });
      clearAllOverrides();
    }
  }, [isAuthenticated]);

  const totals = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, i) => sum + (i.price || 0) * i.quantity,
      0
    );
    const shipping = subtotal > 0 ? 60 : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [state.items]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      ...totals,
      isInCart: (id) => state.items.some((i) => String(i.id) === String(id)),
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [state, totals, addToCart, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
