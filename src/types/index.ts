export interface OpeningHoursDay {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  note?: string;
}

export type OpeningHour = OpeningHoursDay;

export interface BusinessInfo {
  name: string;
  tagline: string;
  category: string;
  description: string;
  shortDescription: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  whatsapp: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  customersServed: number;
  verified: boolean;
  logoUrl?: string;
  heroBadgeText: string;
  deliveryRadius: string;
  deliveryTimeEstimate: string;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  openingHours: OpeningHoursDay[];
}

export interface GroceryProduct {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number; // e.g. 120
  originalPrice?: number; // e.g. 150
  discountPercent?: number; // e.g. 20
  unit: string; // e.g. "1 kg", "500 g", "1 Liter", "Pack of 4"
  image: string;
  inStock: boolean;
  featured: boolean;
  isDealOfTheDay?: boolean;
  tags?: string[]; // e.g. ['Organic', 'Farm Fresh', 'Best Seller', 'Zero Preservatives']
  brand?: string;
  rating: number;
  reviewCount: number;
  order: number;
  active?: boolean;
  pricePrefix?: string;
  // Legacy compatibility fields if needed
  duration?: string;
  iconName?: string;
  icon?: string;
  inclusions?: string[];
}

// Service alias for backward compatibility
export type Service = GroceryProduct;

export interface CartItem {
  product: GroceryProduct;
  quantity: number;
}

export type OrderStatus = 'pending' | 'packing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type DeliveryType = 'delivery' | 'pickup';
export type PaymentMethod = 'cod' | 'upi' | 'card' | 'store_pay';

export interface OrderItem {
  productId: string;
  title: string;
  unit: string;
  price: number;
  quantity: number;
  image: string;
}

export interface SupermarketOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  deliveryType: DeliveryType;
  preferredSlot: string;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  // compatibility fields for enquiry views
  message?: string;
  serviceName?: string;
  serviceId?: string;
  preferredDate?: string;
  preferredTime?: string;
}

// Backward compatibility alias
export type Enquiry = SupermarketOrder;
export type EnquiryStatus = OrderStatus;

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  caption: string;
  category: string;
  featured: boolean;
  active: boolean;
  order: number;
  date?: string;
}

export interface Review {
  id: string;
  customerName: string;
  customerRole?: string;
  avatarUrl?: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  verified: boolean;
  featured: boolean;
  active: boolean;
  source: 'google' | 'direct';
  serviceUsed?: string;
  ownerResponse?: string;
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  neutralBg: string;
}

export interface WebsiteSettings {
  heroTitle: string;
  heroHighlightText: string;
  heroSubtitle: string;
  primaryCtaText: string;
  primaryCtaAction: string;
  secondaryCtaText: string;
  secondaryCtaAction: string;
  heroImageUrl: string;
  heroImageAlt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImageUrl: string;
  canonicalUrl: string;
  themePreset?: 'emerald' | 'sapphire' | 'crimson' | 'amber' | 'slate' | 'violet';
  themeColor?: string;
  enableAnnouncementBar?: boolean;
  announcementText?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    googleMaps?: string;
  };
  announcementBar: {
    enabled: boolean;
    text: string;
    badgeText?: string;
    linkText?: string;
    linkUrl?: string;
  };
  footerAbout: string;
  copyrightText: string;
}

export type SiteSettings = WebsiteSettings;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
  avatarUrl?: string;
  lastLogin?: string;
  createdAt?: string;
  status?: 'active' | 'deactivated';
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

