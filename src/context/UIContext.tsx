import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Product } from '../data/types';

export type ActivePanel = 'drawer' | 'cart' | 'saved' | 'search' | 'quickview' | null;

interface UIContextType {
  activePanel: ActivePanel;
  openPanel: (panel: ActivePanel) => void;
  closePanel: () => void;
  togglePanel: (panel: ActivePanel) => void;
  quickViewProduct: Product | null;
  quickViewTrigger: HTMLElement | null;
  openQuickView: (product: Product, trigger?: HTMLElement | null) => void;
  closeQuickView: () => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewTrigger, setQuickViewTrigger] = useState<HTMLElement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openPanel = useCallback((panel: ActivePanel) => {
    setActivePanel(panel);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(prev => (prev === 'quickview' ? prev : null));
  }, []);

  const togglePanel = useCallback((panel: ActivePanel) => {
    setActivePanel(prev => (prev === panel ? null : panel));
  }, []);

  const openQuickView = useCallback((product: Product, trigger?: HTMLElement | null) => {
    setQuickViewProduct(product);
    setQuickViewTrigger(trigger || null);
    setActivePanel('quickview');
  }, []);

  const closeQuickView = useCallback(() => {
    if (activePanel === 'quickview') {
      setActivePanel(null);
    }
    setQuickViewProduct(null);
    if (quickViewTrigger) {
      quickViewTrigger.focus();
      setQuickViewTrigger(null);
    }
  }, [activePanel, quickViewTrigger]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  // Body scroll lock management when any modal/drawer is open
  useEffect(() => {
    const isLocked = activePanel !== null && activePanel !== 'search';
    if (isLocked) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
      if (activePanel === 'drawer') {
        document.body.classList.add('drawer-open');
      } else if (activePanel === 'cart') {
        document.body.classList.add('cart-open');
      } else if (activePanel === 'saved') {
        document.body.classList.add('saved-open');
      }
    } else {
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
      document.body.classList.remove('drawer-open', 'cart-open', 'saved-open');
    }

    return () => {
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
      document.body.classList.remove('drawer-open', 'cart-open', 'saved-open');
    };
  }, [activePanel]);

  return (
    <UIContext.Provider
      value={{
        activePanel,
        openPanel,
        closePanel,
        togglePanel,
        quickViewProduct,
        quickViewTrigger,
        openQuickView,
        closeQuickView,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export function useUI(): UIContextType {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
