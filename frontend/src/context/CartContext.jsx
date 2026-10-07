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
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const LOCAL_STORAGE_KEY = "cart_items";
// Old client-side price cache; prices now always come from the server
const LEGACY_PRICE_OVERRIDES_KEY = "cart_price_overrides";

// Same order and defaults as the backend's "?variant=" line key
function variantKey(variant) {
  const v = variant && typeof variant === "object" ? variant : {};
  const q = v.paperQuality || "economy";
  const s = v.printSide || "single";
  const z = v.paperSize || "A4";
  const c = v.colorMode || "bw";
  return `${q}|${s}|${z}|${c}`;
}

// A cart line is one book with one set of print options
function makeItemKey(id, variant) {
  return `${String(id)}|${variantKey(variant)}`;
}

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART": {
      return { ...state, items: action.items };
    }
    case "ADD_ITEM": {
      const { item } = action;
      const existing = state.items.find((i) => i.key === item.key);
      let nextItems;
      if (existing) {
        nextItems = state.items.map((i) =>
          i.key === item.key
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        nextItems = [...state.items, { ...item, quantity: item.quantity || 1 }];
      }
      return { ...state, items: nextItems };
    }
    case "REMOVE_ITEM": {
      return { ...state, items: state.items.filter((i) => i.key !== action.key) };
    }
    case "UPDATE_QTY": {
      const { key, quantity } = action;
      const q = Math.max(1, quantity);
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === key ? { ...i, quantity: q } : i
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
    // The server prices every line (print options, sale price, margin)
    const unitPrice = Number.isFinite(Number(it.price)) ? Number(it.price) : 0;
    const hasVariant =
      it.variant &&
      typeof it.variant === "object" &&
      (it.variant.paperQuality || it.variant.printSide || it.variant.paperSize || it.variant.colorMode);
    const variant = hasVariant
      ? {
          paperQuality: it.variant.paperQuality,
          printSide: it.variant.printSide,
          paperSize: it.variant.paperSize,
          colorMode: it.variant.colorMode,
        }
      : undefined;
    const id = book._id || book.id || it.book;
    return {
      key: makeItemKey(id, variant),
      id,
      title: it.title || book.title || "",
      price: unitPrice,
      quantity: qty,
      configured: !!it.configured,
      variant,
      breakdown: it.pricing || null,
    };
  });
}

function readGuestCart() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Older guest carts have no line key
    return parsed.map((i) => ({ ...i, key: i.key || makeItemKey(i.id, i.variant) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { isAuthenticated } = useAuth();

  const refreshFromServer = useCallback(async () => {
    const res = await cartAPI.getCart();
    dispatch({ type: "SET_CART", items: mapBackendCartToLocalItems(res.data) });
  }, []);

  // Hydrate cart on load based on auth state
  useEffect(() => {
    let mounted = true;
    try {
      localStorage.removeItem(LEGACY_PRICE_OVERRIDES_KEY);
    } catch {
      // ignore storage errors
    }
    const load = async () => {
      if (isAuthenticated) {
        // Move anything added while logged out into the account's cart, then load it
        const guestItems = readGuestCart();
        for (const item of guestItems) {
          try {
            await cartAPI.addItem({ bookId: item.id, quantity: item.quantity, variant: item.variant });
          } catch {
            // skip lines the server refuses (e.g. out of stock)
          }
        }
        if (guestItems.length) {
          try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch {
            // ignore storage errors
          }
        }
        try {
          const res = await cartAPI.getCart();
          if (!mounted) return;
          dispatch({ type: "SET_CART", items: mapBackendCartToLocalItems(res.data) });
        } catch {
          // keep current state on error — cart loads in background
        }
      } else {
        dispatch({ type: "SET_CART", items: readGuestCart() });
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

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
      const lineVariant = variant || item.variant;
      if (isAuthenticated) {
        const bookId = item._id || item.bookId || item.id;
        await cartAPI.addItem({ bookId, quantity, variant: lineVariant });
        await refreshFromServer();
        return;
      }
      // Guest cart: the shown price is only an estimate; the server reprices after login
      dispatch({
        type: "ADD_ITEM",
        item: {
          key: makeItemKey(item.id, lineVariant),
          id: item.id,
          title: item.title,
          price: item.price,
          quantity,
          configured: item.configured,
          variant: lineVariant,
          breakdown: item.breakdown,
        },
      });
    },
    [isAuthenticated, refreshFromServer]
  );

  // Lines are addressed by key; a bare book id is accepted for older callers
  const findLine = useCallback(
    ({ key, id }) =>
      state.items.find((i) => (key ? i.key === key : String(i.id) === String(id))),
    [state.items]
  );

  const updateQuantity = useCallback(
    async ({ key, id, quantity }) => {
      const line = findLine({ key, id });
      if (!line) return;
      if (isAuthenticated) {
        try {
          await cartAPI.updateItem({ bookId: line.id, variant: variantKey(line.variant), quantity });
        } finally {
          await refreshFromServer();
        }
        return;
      }
      dispatch({ type: "UPDATE_QTY", key: line.key, quantity });
    },
    [isAuthenticated, findLine, refreshFromServer]
  );

  const removeItem = useCallback(
    async ({ key, id }) => {
      const line = findLine({ key, id });
      if (!line) return;
      // Update UI immediately, even if the API call fails
      dispatch({ type: "REMOVE_ITEM", key: line.key });
      if (isAuthenticated) {
        try {
          await cartAPI.removeItem({ bookId: line.id, variant: variantKey(line.variant) });
        } catch (error) {
          console.error("Failed to remove item from server:", error);
        }
      }
    },
    [isAuthenticated, findLine]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clear();
      } catch (error) {
        console.error("Failed to clear cart on server:", error);
      }
    }
    // Still clear UI even if API fails
    dispatch({ type: "CLEAR" });
  }, [isAuthenticated]);

  // Shipping depends on the delivery location chosen at checkout, so it isn't part of the cart total
  const totals = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, i) => sum + (i.price || 0) * i.quantity,
      0
    );
    return { subtotal, total: subtotal };
  }, [state.items]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      ...totals,
      // With a variant: is that exact line in the cart? Without: is any line of the book?
      isInCart: (id, variant) =>
        state.items.some((i) =>
          variant ? i.key === makeItemKey(id, variant) : String(i.id) === String(id)
        ),
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
