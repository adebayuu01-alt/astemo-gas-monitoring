import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Activity,
  LayoutDashboard,
  Database,
  ChevronDown,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  MoreVertical
} from 'lucide-react';
import astemoBrand from '../assets/astemo_brand.png';

export default function Layout({
  activeMenu,
  onNavigate,
  onLogout,
  currentUser,
  plcConnected = true,
  onTogglePlc,
  children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [masterDataOpen, setMasterDataOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isOperator = currentUser?.role === 'Operator';

  // Realtime clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return {
      dateStr: `${dayName}, ${day} ${month} ${year}`,
      timeStr: `${hh}:${mm}:${ss}`
    };
  };

  const { dateStr, timeStr } = formatDate(currentTime);

  const isDashboardActive =
    activeMenu === 'dashboard' ||
    activeMenu === 'gas-detail-level' ||
    activeMenu === 'gas-detail-pressure' ||
    activeMenu === 'gas-detail-consumption';

  const isMasterDataActive =
    activeMenu === 'master-data-shift' ||
    activeMenu === 'master-data-parameter';

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F2F4F7] overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-[72px] bg-white border-b border-[#E4E7EC] px-6 flex items-center justify-between flex-shrink-0 z-40">
        <div className="flex items-center gap-6">
          {/* Logo & System Brand */}
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => onNavigate('realtime-monitoring')}
          >
            <img
              src={astemoBrand}
              alt="Astemo Gas Monitoring"
              className="h-[40px] w-auto object-contain"
            />
          </div>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Top Right Actions: Only Date & Time */}
        <div className="flex items-center">
          <div className="text-xl text-[#475467] font-medium flex items-center gap-1.5 select-none">
            <span>{dateStr}</span>
            <span className="text-gray-300">|</span>
            <span className="font-bold text-[#1E232F]">{timeStr}</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar - Pinned stay, never scrolls with page content */}
        <aside
          className={`${sidebarOpen ? 'w-64' : 'w-20'
            } h-full bg-white border-r border-[#E4E7EC] flex flex-col justify-between transition-all duration-300 ease-in-out select-none flex-shrink-0 z-20`}
        >
          {/* Menu Sections */}
          <div className="py-6 px-4 space-y-6 overflow-y-auto">
            {/* APPLICATION */}
            <div>
              {sidebarOpen && (
                <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-2 px-2">
                  APPLICATION
                </p>
              )}
              <div className="space-y-1">
                {/* Realtime Monitoring */}
                <button
                  onClick={() => onNavigate('realtime-monitoring')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeMenu === 'realtime-monitoring'
                    ? 'bg-[#EAF8F1] text-[#00A854] font-semibold'
                    : 'text-[#475467] hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  title="Realtime Monitoring"
                >
                  <Gauge className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Realtime Monitoring</span>}
                </button>

                {/* Dashboard */}
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isDashboardActive
                    ? 'bg-[#EAF8F1] text-[#00A854] font-semibold'
                    : 'text-[#475467] hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Dashboard</span>}
                </button>
              </div>
            </div>

            {/* DATABASE (Superadmin & Admin) */}
            {!isOperator && (
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  {sidebarOpen && (
                    <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                      DATABASE
                    </p>
                  )}
                  {sidebarOpen && (
                    <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>

                <div className="space-y-2">
                  {/* Master Data Treeview */}
                  <div>
                    <button
                      onClick={() => {
                        if (sidebarOpen) {
                          setMasterDataOpen(!masterDataOpen);
                        } else {
                          onNavigate('master-data-parameter');
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isMasterDataActive
                        ? 'text-[#00A854] font-semibold'
                        : 'text-[#475467] hover:bg-gray-50'
                        }`}
                      title="Master Data"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Master Data</span>}
                      </div>
                      {sidebarOpen &&
                        (masterDataOpen ? (
                          <ChevronDown className={`w-4 h-4 ${isMasterDataActive ? 'text-[#00A854]' : 'text-gray-400'}`} />
                        ) : (
                          <ChevronRight className={`w-4 h-4 ${isMasterDataActive ? 'text-[#00A854]' : 'text-gray-400'}`} />
                        ))}
                    </button>

                    {/* Master Data Treeview Sub-items */}
                    {sidebarOpen && masterDataOpen && (
                      <div className="relative pl-[36px] pt-1 space-y-1">
                        <div className="absolute left-[20px] top-1 bottom-3 w-[1.5px] bg-[#D0D5DD] pointer-events-none" />

                        {/* Shift */}
                        <div className="relative flex items-center">
                          <div className="absolute left-[-16px] top-1/2 w-3.5 h-[1.5px] bg-[#D0D5DD] pointer-events-none" />
                          <button
                            onClick={() => onNavigate('master-data-shift')}
                            className={`w-full flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeMenu === 'master-data-shift'
                              ? 'bg-[#EAF8F1] text-[#00A854] font-semibold'
                              : 'text-[#475467] hover:bg-gray-50 hover:text-gray-900'
                              }`}
                          >
                            <span>Shift</span>
                          </button>
                        </div>

                        {/* Parameter */}
                        <div className="relative flex items-center">
                          <div className="absolute left-[-16px] top-1/2 w-3.5 h-[1.5px] bg-[#D0D5DD] pointer-events-none" />
                          <button
                            onClick={() => onNavigate('master-data-parameter')}
                            className={`w-full flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeMenu === 'master-data-parameter'
                              ? 'bg-[#EAF8F1] text-[#00A854] font-semibold'
                              : 'text-[#475467] hover:bg-gray-50 hover:text-gray-900'
                              }`}
                          >
                            <span>Parameter</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout at Bottom */}
          <div className="p-4 border-t border-[#E4E7EC]">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#FF4D4F] hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-[#FF4D4F]" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Content Area with Independent Scroll */}
        <div className="flex-1 flex flex-col justify-between min-w-0 min-h-0 overflow-hidden">
          <main
            className={`p-4 w-full max-w-[1720px] mx-auto flex-1 min-h-0 ${activeMenu === 'realtime-monitoring' || activeMenu === 'dashboard'
              ? 'overflow-y-auto flex flex-col'
              : 'overflow-y-auto'
              }`}
          >
            {children}
          </main>

          {/* Fixed Footer at bottom */}
          <footer className="w-full bg-white border-t border-[#E4E7EC] px-5 py-3 flex items-center justify-end text-xs text-[#23262B] font-normal select-none flex-shrink-0 z-10">
            <span>Copyright © 2026 PT. Electrindo Inti Dinamika</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
