import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUI } from './UIContext';
import { PRODUCTS } from '../data/products';

const WISHLIST_STORAGE_KEY = 'palora_wishlist';

interface SavedContextType {
  savedIds: string[];
  isSaved: (productId: string) => boolean;
  toggleSaved: (productId: string) => boolean;
  savedCount: number;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useUI();
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(savedIds));
    } catch (e) {
      console.warn('Could not write to localStorage:', e);
    }
  }, [savedIds]);

  const isSaved = useCallback(
    (productId: string) => {
      return savedIds.includes(productId);
    },
    [savedIds]
  );

  const toggleSaved = useCallback(
    (productId: string) => {
      let isNowSaved = false;
      setSavedIds(prev => {
        if (prev.includes(productId)) {
          isNowSaved = false;
          return prev.filter(id => id !== productId);
        } else {
          isNowSaved = true;
          return [...prev, productId];
        }
      });

      const product = PRODUCTS.find(p => p.id === productId);
      const title = product ? product.name : 'Item';
      showToast(isNowSaved ? `Added "${title}" to your wishlist ✨` : `Removed "${title}" from your wishlist`);

      return isNowSaved;
    },
    [showToast]
  );

  return (
    <SavedContext.Provider
      value={{
        savedIds,
        isSaved,
        toggleSaved,
        savedCount: savedIds.length
      }}
    >
      {children}
    </SavedContext.Provider>
  );
};

export function useSaved(): SavedContextType {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
}
