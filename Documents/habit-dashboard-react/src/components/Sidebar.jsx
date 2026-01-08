import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMugHot, faBrain, faBookOpen, faMoon, faListCheck,
    faTableCellsLarge, faPenNib, faChartLine, faSitemap, faBullseye,
    faRightFromBracket, faXmark, faQuoteRight, faFilm, faShieldHalved,
    faBan, faCircleCheck, faToolbox, faGraduationCap, faClockRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { tabList } from '../data/staticData';

// Icon mapping
const iconMap = {
    faMugHot, faBrain, faBookOpen, faMoon, faListCheck,
    faTableCellsLarge, faPenNib, faChartLine, faSitemap, faBullseye,
    faQuoteRight, faFilm, faShieldHalved, faBan, faCircleCheck,
    faToolbox, faGraduationCap, faYoutube, faClockRotateLeft
};

export default function Sidebar({ isOpen, onClose }) {
    const { logout } = useAuth();
    const { userData } = useData();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            console.error("Logout failed", e);
        }
    }

    const drawerVariants = {
        open: { x: 0 },
        closed: { x: '-100%' }
    };

    return (
        <>
            {/* Desktop Sidebar (Always visible md+) */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 hidden md:flex flex-col z-20">
                <SidebarContent onLogout={handleLogout} level={userData?.level || 1} />
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                        />
                        <motion.aside
                            className="fixed inset-y-0 left-0 w-72 bg-black/90 backdrop-blur-xl border-r border-white/10 flex flex-col z-50 md:hidden"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={drawerVariants}
                            transition={{ type: "tween", duration: 0.3 }}
                        >
                            <SidebarContent onLogout={handleLogout} onClose={onClose} isMobile level={userData?.level || 1} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function SidebarContent({ onLogout, onClose, isMobile, level }) {
    return (
        <>
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h1 className="header-font text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-fire-yellow to-fire-red leading-tight">
                        HABIT<br />DASHBOARD
                    </h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Level {level} • Polaris v2.0</p>
                </div>
                {isMobile && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FontAwesomeIcon icon={faXmark} className="text-xl" />
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {tabList.map(tab => (
                    <NavLink
                        key={tab.id}
                        to={`/dashboard/${tab.id}`}
                        onClick={isMobile ? onClose : undefined}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all font-medium text-sm md:text-base cursor-pointer
                            ${isActive
                                ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,157,0,0.5)] scale-105'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="w-8 flex justify-center">
                                    <FontAwesomeIcon icon={iconMap[tab.icon] || faBullseye} className={isActive ? 'text-fire-yellow' : ''} />
                                </div>
                                <span>{tab.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </>
    );
}
