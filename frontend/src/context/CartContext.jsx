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
    return {
      id: book._id || book.id || it.book, // local key
      title: it.title || book.title || "",
      price: typeof it.price === "number" ? it.price : book.price || 0,
      quantity: it.quantity || 1,
    };
  });
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { isAuthenticated } = useAuth();

  // Hydrate cart on load based on auth state
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (isAuthenticated) {
        // Load from backend
        try {
          const res = await cartAPI.getCart();
          if (!mounted) return;
          const items = mapBackendCartToLocalItems(res.data);
          dispatch({ type: "SET_CART", items });
        } catch {
          // keep current state on error
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
    async ({ item, quantity = 1 }) => {
      const localItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        quantity,
      };

      if (isAuthenticated) {
        const bookId = item._id || item.bookId || item.id;
        try {
          const res = await cartAPI.addItem({ bookId, quantity });
          const items = mapBackendCartToLocalItems(res.data);
          dispatch({ type: "SET_CART", items });
          return;
        } catch {
          // fallback to local update if backend fails
        }
      }

      dispatch({ type: "ADD_ITEM", item: localItem });
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async ({ id, quantity }) => {
      if (isAuthenticated) {
        try {
          const res = await cartAPI.updateItem({ bookId: id, quantity });
          const items = mapBackendCartToLocalItems(res.data);
          dispatch({ type: "SET_CART", items });
          return;
        } catch {
          // fallback to local update
        }
      }
      dispatch({ type: "UPDATE_QTY", id, quantity });
    },
    [isAuthenticated]
  );

  const removeItem = useCallback(
    async ({ id }) => {
      if (isAuthenticated) {
        try {
          await cartAPI.removeItem({ bookId: id });
          // Always update UI immediately, even if API call might fail
          dispatch({ type: "REMOVE_ITEM", id });
          return;
        } catch (error) {
          console.error("Failed to remove item from server:", error);
          // Still remove from UI even if API fails to maintain consistency
          dispatch({ type: "REMOVE_ITEM", id });
        }
      } else {
        dispatch({ type: "REMOVE_ITEM", id });
      }
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await cartAPI.clear();
        dispatch({ type: "CLEAR" });
        return;
      } catch (error) {
        console.error("Failed to clear cart on server:", error);
        // Still clear UI even if API fails
        dispatch({ type: "CLEAR" });
      }
    } else {
      dispatch({ type: "CLEAR" });
    }
  }, [isAuthenticated]);

  const totals = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, i) => sum + (i.price || 0) * i.quantity,
      0
    );
    const shipping = subtotal > 0 ? 5 : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [state.items]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      ...totals,
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