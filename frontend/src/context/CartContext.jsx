import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
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

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

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
    () => ({ state, dispatch, ...totals }),
    [state, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
