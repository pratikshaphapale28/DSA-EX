import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomPlayerBar } from './BottomPlayerBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen max-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white overflow-hidden">
      {/* Top Header */}
      <Header />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center Canvas & Content */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Bottom Transport Playback Bar */}
      <BottomPlayerBar />
    </div>
  );
};
