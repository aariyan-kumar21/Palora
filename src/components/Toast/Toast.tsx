import React, { useEffect, useState } from 'react';
import { useUI } from '../../context/UIContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useUI();
  const [visible, setVisible] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (toastMessage) {
      setCurrentText(toastMessage);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div
      className={`toast ${visible ? 'is-visible' : ''}`}
      id="toast"
      role="status"
      aria-live="polite"
    >
      {currentText}
    </div>
  );
};

export default Toast;
