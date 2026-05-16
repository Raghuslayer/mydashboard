import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMugHot, faBrain, faBookOpen, faMoon, faListCheck,
    faTableCellsLarge, faPenNib, faChartLine, faSitemap, faBullseye,
    faRightFromBracket, faXmark, faQuoteRight, faFilm, faShieldHalved,
    faBan, faCircleCheck, faToolbox, faGraduationCap, faClockRotateLeft,
    faChevronDown, faChevronRight, faSun, faLightbulb, faScroll, faRocket,
    faCalendarDays, faHome, faCog, faHeart, faCrosshairs, faFire
} from '@fortawesome/free-solid-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsModal from './SettingsModal';
import { getTierForLevel } from '../utils/tierSystem';

// Icon mapping
const iconMap = {
    faMugHot, faBrain, faBookOpen, faMoon, faListCheck,
    faTableCellsLarge, faPenNib, faChartLine, faSitemap, faBullseye,
    faQuoteRight, faFilm, faShieldHalved, faBan, faCircleCheck,
    faToolbox, faGraduationCap, faYoutube, faClockRotateLeft,
    faSun, faLightbulb, faScroll, faRocket, faCalendarDays, faHome, faHeart,
    faCrosshairs, faFire
};

// Grouped tab configuration
const sidebarGroups = [
    {
        id: 'routine',
        label: 'Daily Routine',
        icon: faSun,
        items: [
            { id: 'morning', label: 'Morning', icon: 'faMugHot' },
            { id: 'deepWork', label: 'Deep Work', icon: 'faBrain' },
            { id: 'night', label: 'Night', icon: 'faMoon' },
        ]
    },
    {
        id: 'productivity',
        label: 'Productivity',
        icon: faRocket,
        items: [
            { id: 'tasks', label: 'Daily Tasks', icon: 'faListCheck' },
            { id: 'matrix', label: 'Priority Matrix', icon: 'faTableCellsLarge' },
            { id: 'journal', label: 'Journal', icon: 'faPenNib' },
        ]
    },
    {
        id: 'inspiration',
        label: 'Inspiration',
        icon: faLightbulb,
        items: [
            { id: 'achievementJar', label: 'Achievements Resume', icon: 'faHeart' },
            { id: 'challenges', label: 'Challenges', icon: 'faCrosshairs' },
            { id: 'quote', label: 'Daily Wisdom', icon: 'faQuoteRight' },
            { id: 'vault', label: 'Motivation Vault', icon: 'faFilm' },
        ]
    },
    {
        id: 'principles',
        label: 'My Principles',
        icon: faScroll,
        items: [
            { id: 'commitments', label: 'Rules', icon: 'faShieldHalved' },
            { id: 'neverDo', label: 'Never Do', icon: 'faBan' },
            { id: 'mustDo', label: 'Must Do', icon: 'faCircleCheck' },
        ]
    },
    {
        id: 'growth',
        label: 'Growth',
        icon: faChartLine,
        items: [
            { id: 'learning', label: 'Learning', icon: 'faBookOpen' },
            { id: 'skills', label: 'Skills', icon: 'faToolbox' },
            { id: 'skillMap', label: 'Skill Map', icon: 'faSitemap' },
        ]
    },
    {
        id: 'planning',
        label: 'Planning & Review',
        icon: faCalendarDays,
        items: [
            { id: 'semesterGoals', label: 'Semester Goals', icon: 'faGraduationCap' },
            { id: 'goal', label: 'Main Goal', icon: 'faBullseye' },
            { id: 'analytics', label: 'Analytics', icon: 'faChartLine' },
            { id: 'analysis', label: 'Analysis', icon: 'faChartLine' },
            { id: 'history', label: 'History', icon: 'faClockRotateLeft' },
        ]
    },
];

export default function Sidebar({ isOpen, onClose }) {
    const { logout } = useAuth();
    const { userData } = useData();
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = React.useState(false);

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
            <aside className="fixed inset-y-0 left-0 w-64 bg-black/90 backdrop-blur-md border-r border-white/10 hidden md:flex flex-col z-20">
                <SidebarContent onLogout={handleLogout} level={userData?.level || 1} showSettings={showSettings} setShowSettings={setShowSettings} />
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
                            className="fixed inset-y-0 left-0 w-72 bg-black/90 backdrop-blur-md border-r border-white/10 flex flex-col z-50 md:hidden"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={drawerVariants}
                            transition={{ type: "tween", duration: 0.3 }}
                        >
                            <SidebarContent onLogout={handleLogout} onClose={onClose} isMobile level={userData?.level || 1} showSettings={showSettings} setShowSettings={setShowSettings} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </>
    );
}

function SidebarContent({ onLogout, onClose, isMobile, level, showSettings, setShowSettings }) {
    const location = useLocation();
    const currentPath = location.pathname.split('/').pop();

    // Track which groups are expanded - auto-expand group containing current tab
    const [expandedGroups, setExpandedGroups] = useState(() => {
        const initialExpanded = {};
        sidebarGroups.forEach(group => {
            const hasActiveItem = group.items.some(item => item.id === currentPath);
            initialExpanded[group.id] = hasActiveItem;
        });
        return initialExpanded;
    });

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    return (
        <>
            <div className="p-5 border-b border-white/5 relative overflow-hidden">
                {/* Background ambient glow */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-fire-orange/5 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Warrior Avatar */}
                        <div className="relative group cursor-pointer">
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-fire-orange/50 shadow-[0_0_15px_rgba(255,94,0,0.3)] transition-transform group-hover:scale-105">
                                <img 
                                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200&auto=format&fit=crop" 
                                    alt="Warrior Profile" 
                                    className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="header-font text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-fire-yellow to-fire-red leading-none tracking-wider drop-shadow-md">
                                IRON
                            </h1>
                            <h1 className="header-font text-2xl md:text-3xl text-white leading-none tracking-widest mt-1">
                                DISCIPLINE
                            </h1>
                        </div>
                    </div>
                    {isMobile && (
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
                            <FontAwesomeIcon icon={faXmark} className="text-2xl" />
                        </button>
                    )}
                </div>

                {/* Massive Tier Badge */}
                <div className="mt-5 bg-black/40 rounded-xl p-3 border border-white/10 flex items-center gap-4 shadow-lg relative overflow-hidden group">
                        {/* Subtle background glow based on tier color */}
                        <div 
                            className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
                            style={{ background: `linear-gradient(135deg, ${getTierForLevel(level).color}, transparent)` }}
                        />
                        
                        <div 
                            className="flex items-center justify-center w-12 h-12 rounded-lg relative z-10"
                            style={{ 
                                color: getTierForLevel(level).color,
                                border: `1px solid ${getTierForLevel(level).color}50`,
                                background: `radial-gradient(circle at top left, ${getTierForLevel(level).color}20, transparent)`,
                                boxShadow: `0 0 15px ${getTierForLevel(level).color}20 inset`
                            }}
                        >
                            <FontAwesomeIcon icon={getTierForLevel(level).icon} className="text-2xl drop-shadow-md" style={{ filter: `drop-shadow(0 0 8px ${getTierForLevel(level).color}60)` }} />
                        </div>
                        <div className="relative z-10">
                            <p 
                                className="font-black uppercase tracking-[0.25em] text-[14px]"
                                style={{ color: getTierForLevel(level).color, textShadow: `0 0 15px ${getTierForLevel(level).color}40` }}
                            >
                                {getTierForLevel(level).name}
                            </p>
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest mt-0.5">
                                Level <span className="text-gray-200 font-bold">{level}</span>
                            </p>
                        </div>
                    </div>
                </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                {/* Overview - Always visible at top */}
                <NavLink
                    to="/dashboard/overview"
                    onClick={isMobile ? onClose : undefined}
                    className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all mb-2 ${isActive
                            ? 'bg-gradient-to-r from-fire-orange/20 to-fire-red/20 text-white shadow-[0_0_15px_rgba(255,94,0,0.3)] border border-fire-orange/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faHome} className="text-lg" />
                    <span className="font-semibold">Overview</span>
                </NavLink>

                {/* Grouped Tabs */}
                {sidebarGroups.map(group => {
                    const isExpanded = expandedGroups[group.id];
                    const hasActiveItem = group.items.some(item => item.id === currentPath);

                    return (
                        <div key={group.id} className="mb-1">
                            {/* Group Header */}
                            <button
                                onClick={() => toggleGroup(group.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all text-sm
                                    ${hasActiveItem
                                        ? 'text-fire-orange bg-fire-orange/10'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={group.icon} className={hasActiveItem ? 'text-fire-orange' : ''} />
                                    <span className="font-medium">{group.label}</span>
                                </div>
                                <FontAwesomeIcon
                                    icon={isExpanded ? faChevronDown : faChevronRight}
                                    className="text-xs opacity-50"
                                />
                            </button>

                            {/* Group Items */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-4 mt-1 space-y-0.5">
                                            {group.items.map(item => (
                                                <NavLink
                                                    key={item.id}
                                                    to={`/dashboard/${item.id}`}
                                                    onClick={isMobile ? onClose : undefined}
                                                    className={({ isActive }) =>
                                                        `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm
                                                        ${isActive
                                                            ? 'bg-white/10 text-white shadow-[0_0_8px_rgba(255,157,0,0.4)]'
                                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                                        }`
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={iconMap[item.icon] || faBullseye}
                                                        className="text-xs w-4"
                                                    />
                                                    <span>{item.label}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-white/5 bg-black/20">
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm mb-2"
                >
                    <FontAwesomeIcon icon={faCog} />
                    <span className="font-medium">Settings</span>
                </button>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </>
    );
}
