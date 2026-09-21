import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { SEOHelmet } from './components/SEOHelmet';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { DailyDeals } from './components/DailyDeals';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { GallerySection } from './components/GallerySection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';
import { BookingModal } from './components/BookingModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ToastContainer } from './components/ToastContainer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

const AppContent: React.FC = () => {
  const { currentView, currentUser } = useData();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);

  const handleOpenBooking = (serviceId?: string) => {
    setPreselectedServiceId(serviceId);
    setIsBookingOpen(true);
  };

  // If in Admin view
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <SEOHelmet />
        <ToastContainer />
        {currentUser ? <AdminLayout /> : <AdminLogin />}
      </div>
    );
  }

  // Public Facing Business Website
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased selection:bg-emerald-500 selection:text-white relative">
      {/* Dynamic SEO & JSON-LD Structured Data */}
      <SEOHelmet />

      {/* Global Interactive Notifications */}
      <ToastContainer />

      {/* Navigation Header with Announcement & Emergency contact */}
      <Header onOpenBooking={() => handleOpenBooking()} />

      {/* Hero Section with Google Ratings & Visual CTA */}
      <main id="main-content">
        <Hero onOpenBooking={() => handleOpenBooking()} />

        {/* Trust Metrics Bar */}
        <TrustBar />

        {/* Daily Deals & Flash Offers Showcase */}
        <DailyDeals />

        {/* Comprehensive Supermarket Grocery & Stationery Catalog */}
        <ServicesSection onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* Supermarket Story & Aisles */}
        <AboutSection onOpenBooking={() => handleOpenBooking()} />

        {/* Why Choose Us Clinical Differentiators */}
        <WhyChooseUs />

        {/* Facility & Diagnostic Suites Photo Tour */}
        <GallerySection />

        {/* Patient Testimonials & Google Ratings */}
        <ReviewsSection />

        {/* Google Maps & 7-Day Timings Schedule */}
        <LocationSection />

        {/* Quick Contact & Reception Enquiry Form */}
        <ContactSection />
      </main>

      {/* Footer with Business Links & Schema Verification */}
      <Footer onOpenBooking={(id) => handleOpenBooking(id)} />

      {/* Floating Call & WhatsApp Channels */}
      <FloatingActions />

      {/* Slide-in Shopping Bag / Cart Drawer */}
      <CartDrawer />

      {/* Online Supermarket Express Checkout & Invoicing Modal */}
      <CheckoutModal />

      {/* Interactive Appointment Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedServiceId={preselectedServiceId}
      />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
