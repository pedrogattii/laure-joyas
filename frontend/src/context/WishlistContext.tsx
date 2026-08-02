'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ProductItem } from '@/lib/types';

interface WishlistContextType {
  wishlist: ProductItem[];
  addToWishlist: (product: ProductItem) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: ProductItem) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'lj_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<ProductItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading wishlist:', e);
      }
    }
  }, []);

  const saveWishlist = (updated: ProductItem[]) => {
    setWishlist(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addToWishlist = useCallback((product: ProductItem) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      const updated = [...prev, product];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleWishlist = useCallback((product: ProductItem) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      const updated = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((p) => p.id === productId),
    [wishlist]
  );

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist debe ser usado dentro de un WishlistProvider');
  }
  return context;
}
