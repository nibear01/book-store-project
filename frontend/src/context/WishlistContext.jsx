/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import { wishlistAPI } from '../api/wishlist-api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'ADD': {
      const exists = state.items.some(i => (i.id || i._id) === action.item.id);
      return exists ? state : { ...state, items: [action.item, ...state.items] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => (i.id || i._id) !== action.id) };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

function mapBackendToLocalItems(wishlist) {
  const items = wishlist?.items || [];
  return items.map(it => {
    const book = typeof it.book === 'object' ? it.book : { _id: it.book };
    return {
      id: book._id,
      title: it.title || book.title || '',
      price: typeof it.price === 'number' ? it.price : book.price || 0,
      book,
      added_at: it.added_at || undefined,
    };
  });
}

export function WishlistProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const { isAuthenticated, setIsLoading } = useAuth();
  const isInitialLoadRef = React.useRef(true);

  // Load wishlist on auth
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isAuthenticated) {
        dispatch({ type: 'SET_ITEMS', items: [] });
        return;
      }
      try {
        if (setIsLoading && isInitialLoadRef.current) setIsLoading(true);
        const res = await wishlistAPI.getWishlist();
        if (!mounted) return;
        dispatch({ type: 'SET_ITEMS', items: mapBackendToLocalItems(res.data) });
      } catch {
        // silent
      } finally {
        if (setIsLoading && isInitialLoadRef.current) setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    };
    load();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await wishlistAPI.getWishlist();
    dispatch({ type: 'SET_ITEMS', items: mapBackendToLocalItems(res.data) });
  }, [isAuthenticated]);

  const add = useCallback(async (bookId) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    const res = await wishlistAPI.addItem({ bookId });
    dispatch({ type: 'SET_ITEMS', items: mapBackendToLocalItems(res.data) });
  }, [isAuthenticated]);

  const remove = useCallback(async (bookId) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    await wishlistAPI.removeItem({ bookId });
    dispatch({ type: 'REMOVE', id: bookId });
  }, [isAuthenticated]);

  const clear = useCallback(async () => {
    if (!isAuthenticated) return;
    await wishlistAPI.clear();
    dispatch({ type: 'CLEAR' });
  }, [isAuthenticated]);

  const isInWishlist = useCallback((bookId) => {
    return state.items.some(i => (i.id || i._id) === bookId);
  }, [state.items]);

  const count = state.items.length;

  const value = useMemo(() => ({
    state,
    items: state.items,
    count,
    refresh,
    add,
    remove,
    clear,
    isInWishlist,
  }), [state, count, refresh, add, remove, clear, isInWishlist]);

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
