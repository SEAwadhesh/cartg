import React from 'react';
import { ProductCatalog } from './ProductCatalog';

interface ServicesSectionProps {
  onOpenBooking?: (serviceId?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = () => {
  return <ProductCatalog />;
};
