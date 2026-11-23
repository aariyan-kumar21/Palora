import React from 'react';
import { hasWhatsApp, waLink } from '../../data/config';
import { useUI } from '../../context/UIContext';
import { Icon } from '../Icon/Icon';

export const FloatingWhatsApp: React.FC = () => {
  const { activePanel } = useUI();
  if (!hasWhatsApp()) return null;

  const isHidden = activePanel !== null && activePanel !== 'search';

  return (
    <a
      id="floatingWaBtn"
      className={`floating-wa-btn ${isHidden ? 'is-hidden-modal' : ''}`}
      href={waLink("Hi Palora! I'd like to know more about your gifts.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
    >
      <span className="floating-wa-tooltip" aria-hidden="true">
        Chat with us
      </span>
      <Icon name="whatsapp" size={28} strokeWidth={1.5} />
    </a>
  );
};

export default FloatingWhatsApp;
