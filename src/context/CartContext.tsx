import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '../data/types';
import { useUI } from './UIContext';

const CART_STORAGE_KEY = 'palora_cart_items';

interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product, quantity?: number, note?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  updateNote: (cartItemId: string, note: string) => void;
  clearCart: () => void;
  totalCount: number;
  totalAmount: number;
  badgeBump: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useUI();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [badgeBump, setBadgeBump] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage:', e);
    }
  }, [cart]);

  const triggerBadgeBump = useCallback(() => {
    setBadgeBump(true);
    setTimeout(() => setBadgeBump(false), 300);
  }, []);

  const addItem = useCallback(
    (product: Product, quantity = 1, note = '') => {
      const customNote = note && note.trim() ? note.trim() : 'Standard (No custom text requested)';

      setCart(prev => {
        const existingIndex = prev.findIndex(
          item => item.id === product.id && item.note === customNote
        );

        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              cartItemId: Date.now() + Math.random().toString(36).substring(2, 6),
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              note: customNote,
              quantity: quantity
            }
          ];
        }
      });

      triggerBadgeBump();
      showToast('Added to cart ✨');
    },
    [showToast, triggerBadgeBump]
  );

  const removeItem = useCallback(
    (cartItemId: string) => {
      setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
      showToast('Item removed from cart');
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (cartItemId: string, delta: number) => {
      setCart(prev => {
        const item = prev.find(i => i.cartItemId === cartItemId);
        if (!item) return prev;
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
          showToast('Item removed from cart');
          return prev.filter(i => i.cartItemId !== cartItemId);
        }
        return prev.map(i => (i.cartItemId === cartItemId ? { ...i, quantity: newQty } : i));
      });
    },
    [showToast]
  );

  const updateNote = useCallback((cartItemId: string, note: string) => {
    const finalNote = note.trim() ? note.trim() : 'Standard (No custom text requested)';
    setCart(prev =>
      prev.map(i => (i.cartItemId === cartItemId ? { ...i, note: finalNote } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        updateNote,
        clearCart,
        totalCount,
        totalAmount,
        badgeBump
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
