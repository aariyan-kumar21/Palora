import React, { Suspense, useEffect } from 'react';
import { useUI } from '../../context/UIContext';

const LazySearchPanel = React.lazy(() => import('./SearchPanel'));

let prefetched = false;
export const prefetchSearchPanel = () => {
  if (!prefetched) {
    prefetched = true;
    import('./SearchPanel');
  }
};

export const SearchPanelLazy: React.FC = () => {
  const { activePanel } = useUI();
  const isOpen = activePanel === 'search';
  if (isOpen) {
    prefetched = true;
  }

  useEffect(() => {
    // Prefetch on idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => prefetchSearchPanel());
    } else {
      setTimeout(() => prefetchSearchPanel(), 1000);
    }
  }, []);

  if (!isOpen && !prefetched) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazySearchPanel />
    </Suspense>
  );
};

export default SearchPanelLazy;
