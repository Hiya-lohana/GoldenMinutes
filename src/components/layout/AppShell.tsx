import React, { useState } from 'react';
import { TopHeader } from '../common/TopHeader';
import { Sidebar } from '../common/Sidebar';
import { ToastContainer } from '../common/ToastContainer';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      <TopHeader />
      
      {/* Mobile Drawer Toggle Floating Action */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Responsive Sidebar */}
      <div className={`md:block ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="md:pl-64 pt-16 min-h-screen flex flex-col justify-between">
        <div className="flex-1 w-full">{children}</div>
        
        {/* Clean Operational Footer */}
        <footer className="w-full border-t border-slate-200/80 bg-white py-3.5 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">GoldenMinutes Emergency Coordination Platform</span>
            <span>•</span>
            <span>Every second matters. Every resource counts.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>TLS 256-Bit Encrypted</span>
            <span>•</span>
            <span>Direct CAD Telemetry Synced (14ms)</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
