import React from 'react';
import { hasWhatsApp } from '../../data/config';
import { Icon } from '../Icon/Icon';

interface CheckoutActionProps {
  onCheckout: () => void;
  disabled?: boolean;
}

export const CheckoutAction: React.FC<CheckoutActionProps> = ({ onCheckout, disabled }) => {
  const configured = hasWhatsApp();
  const isDisabled = disabled || !configured;

  return (
    <button
      type="button"
      className="cart-action-btn proceed-whatsapp-btn"
      id="proceedWhatsAppBtn"
      disabled={isDisabled}
      style={{ opacity: isDisabled ? (configured ? 0.5 : 0.6) : 1 }}
      onClick={onCheckout}
    >
      <Icon name="whatsapp" size={20} className="whatsapp-btn-icon" />
      <span>{configured ? 'Proceed to WhatsApp' : 'WhatsApp ordering coming soon'}</span>
    </button>
  );
};

export default CheckoutAction;
