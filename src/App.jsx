import React, { useState } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RealtimeMonitoringPage from './pages/RealtimeMonitoringPage';
import DashboardPage from './pages/DashboardPage';
import GasDetailLevelPage from './pages/GasDetailLevelPage';
import GasDetailPressurePage from './pages/GasDetailPressurePage';
import GasDetailConsumptionPage from './pages/GasDetailConsumptionPage';
import MasterDataShiftPage from './pages/MasterDataShiftPage';
import MasterDataParameterPage from './pages/MasterDataParameterPage';
import { GasDataProvider } from './context/GasDataContext';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('realtime-monitoring');
  const [plcConnected, setPlcConnected] = useState(true);

  const isOperator = currentUser?.role === 'Operator';

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveMenu('realtime-monitoring');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleNavigate = (menu) => {
    // Suep (Operator) can only view Realtime Monitoring and Dashboard
    const operatorAllowed = [
      'realtime-monitoring',
      'dashboard',
      'gas-detail-level',
      'gas-detail-pressure',
      'gas-detail-consumption'
    ];
    if (isOperator && !operatorAllowed.includes(menu)) {
      return;
    }
    setActiveMenu(menu);
  };

  const togglePlc = () => {
    setPlcConnected((prev) => !prev);
  };

  // If not logged in, render LoginPage
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <GasDataProvider>
      <Layout
        activeMenu={activeMenu}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        currentUser={currentUser}
        plcConnected={plcConnected}
        onTogglePlc={togglePlc}
      >
        {/* APPLICATION: Realtime Monitoring */}
        {activeMenu === 'realtime-monitoring' && <RealtimeMonitoringPage />}

        {/* APPLICATION: Dashboard */}
        {activeMenu === 'dashboard' && (
          <DashboardPage
            onNavigateToDetail={(type) => {
              if (type === 'tank-level') setActiveMenu('gas-detail-level');
              else if (type === 'tank-pressure') setActiveMenu('gas-detail-pressure');
              else if (type === 'tank-consumption') setActiveMenu('gas-detail-consumption');
            }}
          />
        )}

        {/* DETAIL PAGES */}
        {activeMenu === 'gas-detail-level' && (
          <GasDetailLevelPage onBackToDashboard={() => setActiveMenu('dashboard')} />
        )}

        {activeMenu === 'gas-detail-pressure' && (
          <GasDetailPressurePage onBackToDashboard={() => setActiveMenu('dashboard')} />
        )}

        {activeMenu === 'gas-detail-consumption' && (
          <GasDetailConsumptionPage onBackToDashboard={() => setActiveMenu('dashboard')} />
        )}

        {/* DATABASE: Master Data (Treeview) */}
        {!isOperator && activeMenu === 'master-data-shift' && (
          <MasterDataShiftPage />
        )}

        {!isOperator && activeMenu === 'master-data-parameter' && (
          <MasterDataParameterPage />
        )}
      </Layout>
    </GasDataProvider>
  );
}

