import React from 'react';
import { CheckoutModal } from './CheckoutModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = () => {
  return <CheckoutModal />;
};
