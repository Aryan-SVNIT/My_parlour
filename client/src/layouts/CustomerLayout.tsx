import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/common/Footer';
import { Navbar } from '../components/common/Navbar';
import { TrackBookingModal } from '../components/common/TrackBookingModal';
import { WhatsAppButton } from '../components/common/WhatsAppButton';

export const CustomerLayout: React.FC = () => {
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-charcoal-800 font-sans">
      <Navbar onOpenTrackModal={() => setIsTrackModalOpen(true)} />
      <main className="flex-1">
        <Outlet context={{ openTrackModal: () => setIsTrackModalOpen(true) }} />
      </main>
      <Footer />
      <WhatsAppButton />
      <TrackBookingModal isOpen={isTrackModalOpen} onClose={() => setIsTrackModalOpen(false)} />
    </div>
  );
};

