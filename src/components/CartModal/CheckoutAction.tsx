import React from 'react';
import { hasWhatsApp } from '../../data/config';
import SlideCommit from '../SlideCommit/SlideCommit';

interface CheckoutActionProps {
  onCheckout: () => void;
  disabled?: boolean;
}

export const CheckoutAction: React.FC<CheckoutActionProps> = ({ onCheckout, disabled }) => {
  const configured = hasWhatsApp();
  const isDisabled = disabled || !configured;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }} id="proceedWhatsAppBtn">
      <SlideCommit
        label={configured ? 'Slide to confirm order' : 'Add WhatsApp number to order'}
        doneLabel="Opening WhatsApp"
        errorLabel="Order failed"
        onConfirm={onCheckout}
        trackColor="#722F37"
        handleColor="#FFF7F2"
        successColor="#22c55e"
        dangerColor="#B5173A"
        width={340}
        height={56}
        radius={28}
        speed={50}
        returnBounce={0.38}
        landingDip={0.026}
        holdMs={60000}
        disabled={isDisabled}
      />
    </div>
  );
};

export default CheckoutAction;
