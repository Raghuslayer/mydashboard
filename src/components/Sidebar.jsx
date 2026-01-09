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
    faChevronDown, faChevronRight, faSun, faLightbulb, faScroll, faRocket, faCalendarDays
} from '@fortawesome/free-solid-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

// Icon mapping
const iconMap = {
    faMugHot, faBrain, faBookOpen, faMoon, faListCheck,
    faTableCellsLarge, faPenNib, faChartLine, faSitemap, faBullseye,
    faQuoteRight, faFilm, faShieldHalved, faBan, faCircleCheck,
    faToolbox, faGraduationCap, faYoutube, faClockRotateLeft,
    faSun, faLightbulb, faScroll, faRocket, faCalendarDays
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
            { id: 'lesson', label: 'Daily Lesson', icon: 'faYoutube' },
            { id: 'quote', label: 'Stoic Quote', icon: 'faQuoteRight' },
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
            { id: 'analysis', label: 'Analysis', icon: 'faChartLine' },
            { id: 'history', label: 'History', icon: 'faClockRotateLeft' },
        ]
    },
];

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
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h1 className="header-font text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-fire-yellow to-fire-red leading-tight">
                        HABIT<br />DASHBOARD
                    </h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Level {level} • v2.0</p>
                </div>
                {isMobile && (
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <FontAwesomeIcon icon={faXmark} className="text-xl" />
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
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
