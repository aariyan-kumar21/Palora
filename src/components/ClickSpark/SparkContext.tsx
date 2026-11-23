import React, { createContext, useContext, useRef, useCallback, useEffect, useState } from 'react';
import ClickSpark, { ClickSparkHandle } from './ClickSpark';

interface SparkContextType {
  fire: (clientX: number, clientY: number) => void;
}

const SparkContext = createContext<SparkContextType | undefined>(undefined);

export interface SparkProviderProps {
  children: React.ReactNode;
  /** When true, renders a local absolute overlay instead of a fixed full-viewport overlay (useful inside dialogs) */
  isDialog?: boolean;
}

export const SparkProvider: React.FC<SparkProviderProps> = ({ children, isDialog = false }) => {
  const sparkRef = useRef<ClickSparkHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Idle/deferred mounting after first paint
    if ('requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => setMounted(true));
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const fire = useCallback((clientX: number, clientY: number) => {
    if (sparkRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      sparkRef.current.spark(localX, localY);
    }
  }, []);

  return (
    <SparkContext.Provider value={{ fire }}>
      {children}
      {mounted && (
        <div
          ref={containerRef}
          aria-hidden="true"
          style={{
            position: isDialog ? 'absolute' : 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <ClickSpark
            ref={sparkRef}
            trigger="none"
            sparkColor={['#B5173A', '#D7A7B1', '#F2C4CE']}
            shape="line"
            sparkCount={8}
            sparkSize={10}
            sparkWidth={2}
            sparkRadius={26}
            duration={450}
            easing="ease-out"
            randomness={0.25}
          />
        </div>
      )}
    </SparkContext.Provider>
  );
};

export function useSpark(): SparkContextType {
  const context = useContext(SparkContext);
  if (!context) {
    // Fallback no-op if outside provider
    return { fire: () => {} };
  }
  return context;
}
