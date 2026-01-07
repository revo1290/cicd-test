'use client';

import { useState } from 'react';
import { useSplunk } from '@/lib/context/splunk-context';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import DashboardView from '@/components/DashboardView';
import SearchView from '@/components/SearchView';
import CustomDashboardView from '@/components/CustomDashboardView';
import TutorialView from '@/components/TutorialView';

export default function Home() {
  const { currentView } = useSplunk();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'search' && <SearchView />}
          {currentView === 'custom' && <CustomDashboardView />}
          {currentView === 'tutorial' && <TutorialView />}
        </main>
      </div>
    </div>
  );
}
