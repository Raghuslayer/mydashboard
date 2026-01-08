import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatsBar from '../components/StatsBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useData } from '../contexts/DataProvider';

export default function DashboardLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { userData } = useData();

    return (
        <div className="flex h-screen overflow-hidden w-full relative bg-gradient-to-br from-gray-900 to-black text-gray-200">
            {/* Sidebar (Desktop: static, Mobile: drawer) */}
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content Area with left margin for desktop sidebar */}
            <main className="flex-1 overflow-y-auto relative custom-scrollbar flex flex-col h-full w-full md:ml-64">
                {/* Mobile Header */}
                <header className="md:hidden p-4 flex items-center justify-between glass-panel sticky top-0 z-30 mb-4 mx-4 mt-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white hover:text-fire-orange transition-colors">
                            <FontAwesomeIcon icon={faBars} className="text-xl" />
                        </button>
                        <div>
                            <h1 className="header-font text-xl text-white tracking-widest">HABIT DASH</h1>
                            <div className="h-1 w-full bg-gradient-to-r from-fire-orange to-fire-red rounded-full mt-1"></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-fire-orange border border-fire-orange/30">
                            LVL {userData?.level || 1}
                        </span>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 w-full max-w-full">
                    <StatsBar />
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
