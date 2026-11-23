import React, { Suspense } from 'react';
import { UIProvider } from './context/UIContext';
import { CartProvider } from './context/CartContext';
import { SavedProvider } from './context/SavedContext';
import { SparkProvider } from './components/ClickSpark/SparkContext';
import { Header } from './components/Header/Header';
import { SearchPanelLazy } from './components/SearchPanel/SearchPanelLazy';
import { MenuDrawer } from './components/MenuDrawer/MenuDrawer';
import { SavedPanel } from './components/SavedPanel/SavedPanel';
import { CartModal } from './components/CartModal/CartModal';
import { QuickView } from './components/QuickView/QuickView';
import { FloatingWhatsApp } from './components/FloatingWhatsApp/FloatingWhatsApp';
import { Toast } from './components/Toast/Toast';
import { ScrollToHash } from './components/ScrollToHash/ScrollToHash';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <UIProvider>
      <CartProvider>
        <SavedProvider>
          <SparkProvider>
            {/* Accessibility skip link */}
            <a className="skip-link" href="#main">
              Skip to content
            </a>

            {/* Scroll to hash helper */}
            <ScrollToHash />

            {/* Global Header */}
            <Header />

            {/* Modals, Drawers & Overlays */}
            <SearchPanelLazy />
            <MenuDrawer />
            <SavedPanel />
            <CartModal />
            <QuickView />

            {/* Main Application Routes */}
            <Suspense fallback={<div style={{ minHeight: '100vh' }} aria-hidden="true" />}>
              <AppRoutes />
            </Suspense>

            {/* Notification Toast */}
            <Toast />

            {/* Floating WhatsApp Quick Action */}
            <FloatingWhatsApp />
          </SparkProvider>
        </SavedProvider>
      </CartProvider>
    </UIProvider>
  );
};

export default App;
