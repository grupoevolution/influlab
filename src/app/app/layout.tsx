'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { BroadcastListener } from '@/components/notifications/BroadcastListener';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0 fixed inset-y-0 left-0 z-40">
        <Sidebar />
      </div>

      {/* Mobile sidebar (overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 md:hidden bg-bg/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 md:ml-64 min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="pb-32 md:pb-12">{children}</main>
      </div>

      {/* Bottom nav (mobile only) */}
      <BottomNav onMore={() => setMobileOpen(true)} />

      {/* Welcome tour (first visit) */}
      <WelcomeTour />

      {/* Broadcast vindo do painel admin */}
      <BroadcastListener />
    </div>
  );
}
