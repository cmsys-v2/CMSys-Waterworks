import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPortal } from './components/auth/LoginPortal';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { BowserDutyManagement } from './components/bowser/BowserDutyManagement';
import { RealTimeLoadingLog } from './components/loading/RealTimeLoadingLog';
import { WaterPointLocations } from './components/locations/WaterPointLocations';
import { RequestPriorityManager } from './components/requests/RequestPriorityManager';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <LoginPortal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <MainDashboard />}
          {activeTab === 'bowser' && <BowserDutyManagement />}
          {activeTab === 'loading' && <RealTimeLoadingLog />}
          {activeTab === 'ro-points' && <WaterPointLocations category="RO" />}
          {activeTab === 'standard-points' && <WaterPointLocations category="Standard" />}
          {activeTab === 'requests' && <RequestPriorityManager />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainLayout />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
