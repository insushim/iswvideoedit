'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showMobileNav?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = true,
  showMobileNav = true,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} isMenuOpen={isSidebarOpen} />

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        )}

        {/* Main Content */}
        <main
          className={cn(
            'min-h-[calc(100vh-4rem)] flex-1 transition-all duration-300',
            showSidebar && 'lg:ml-64',
            showMobileNav && 'pb-20 lg:pb-0'
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      {showMobileNav && <MobileNav />}
    </div>
  );
};

export default MainLayout;
