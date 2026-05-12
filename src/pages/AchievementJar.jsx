import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTrophy, faPlus, faStar, faMedal, faCrown, faFire, 
    faRocket, faHeart, faBolt, faGem, faCalendar, faFilter,
    faEdit, faTrash, faCheck
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';

// Achievement icons pool
const achievementIcons = [faTrophy, faStar, faMedal, faCrown, faFire, faRocket, faHeart, faBolt, faGem];

// Achievement colors pool - MASCULINE & POWERFUL
const achievementColors = [
    'from-red-600 to-red-800',
    'from-blue-600 to-blue-900',
    'from-emerald-600 to-emerald-800',
    'from-amber-500 to-amber-700',
    'from-purple-600 to-purple-900',
    'from-cyan-500 to-cyan-700',
    'from-orange-600 to-orange-800',
    'from-slate-500 to-slate-700',
];

// Each theme: o=outerRing, i=innerFace, ic=iconColor, gr=glow rgb (for box-shadow use)
const MEDAL_THEMES = [
    { o:'linear-gradient(145deg,#4a3010 0%,#9a7030 40%,#5c3c14 100%)', i:'linear-gradient(145deg,#1f1208,#2d1c0c)', ic:'#c8943a', gr:'200,148,58'  }, // 0 bronze
    { o:'linear-gradient(145deg,#2a3540 0%,#526880 40%,#2a3540 100%)', i:'linear-gradient(145deg,#0a1018,#141e28)', ic:'#6090b0', gr:'60,140,190'  }, // 1 steel
    { o:'linear-gradient(145deg,#4a1010 0%,#801a1a 40%,#4a1010 100%)', i:'linear-gradient(145deg,#120404,#1e0808)', ic:'#a03030', gr:'160,40,40'    }, // 2 crimson
    { o:'linear-gradient(145deg,#2a2a10 0%,#4a4a1e 40%,#2a2a10 100%)', i:'linear-gradient(145deg,#0a0a04,#161608)', ic:'#787830', gr:'120,120,40'   }, // 3 olive
    { o:'linear-gradient(145deg,#1c1c2a 0%,#303048 40%,#1c1c2a 100%)', i:'linear-gradient(145deg,#060608,#0c0c14)', ic:'#5050a0', gr:'80,80,180'    }, // 4 obsidian
    { o:'linear-gradient(145deg,#252525 0%,#484848 40%,#252525 100%)', i:'linear-gradient(145deg,#080808,#121212)', ic:'#606060', gr:'80,80,80'     }, // 5 gunmetal
    { o:'linear-gradient(145deg,#3d200a 0%,#7a4014 40%,#3d200a 100%)', i:'linear-gradient(145deg,#100806,#1e1008)', ic:'#a05828', gr:'160,90,40'   }, // 6 copper
    { o:'linear-gradient(145deg,#0a1e10 0%,#183c20 40%,#0a1e10 100%)', i:'linear-gradient(145deg,#040a06,#0c180e)', ic:'#306040', gr:'40,110,60'    }, // 7 forest
];
const CHALLENGE_THEME = { o:'linear-gradient(145deg,#6a5010 0%,#c8a020 40%,#6a5010 100%)', i:'linear-gradient(145deg,#181204,#2a2008)', ic:'#e8c040', gr:'200,168,30' };

// Warrior badge shapes — angular, military, forged feel
const BADGE_SHAPES = [
    // Military hex — most iconic war badge
    'polygon(50% 0%, 92% 26%, 92% 74%, 50% 100%, 8% 74%, 8% 26%)',
    // War shield — warrior's shield
    'polygon(50% 0%, 100% 18%, 100% 68%, 50% 100%, 0% 68%, 0% 18%)',
    // Octagon — tactical, strong
    'polygon(29% 0%,71% 0%,100% 29%,100% 71%,71% 100%,29% 100%,0% 71%,0% 29%)',
    // Medal cross — military decoration
    'polygon(34% 0%,66% 0%,66% 34%,100% 34%,100% 66%,66% 66%,66% 100%,34% 100%,34% 66%,0% 66%,0% 34%,34% 34%)',
    // War diamond — angular power
    'polygon(50% 0%, 95% 40%, 75% 100%, 25% 100%, 5% 40%)',
];

// Badge physics size
const BADGE_SIZE = 86;
// Max drift speed in px per normalised frame (very slow)
const MAX_SPEED  = 0.42;
const MIN_SPEED  = 0.10;

// ── Module-level shared physics registry for collision detection ──────────────
// Each badge writes its latest { x, y, vx, vy } here every frame.
const globalPhysics = new Map();

export default function AchievementJar() {
    const { achievementJar, addAchievement, updateAchievement, deleteAchievement } = useData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);
    const [editingAchievement, setEditingAchievement] = useState(null);
    const [timeFilter, setTimeFilter] = useState('all'); // all, week, month, year
    const [viewMode, setViewMode] = useState('floating'); // floating, grid

    // Filter achievements by time
    const filteredAchievements = useMemo(() => {
        if (timeFilter === 'all') return achievementJar;

        const now = Date.now();
        const timeRanges = {
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000,
            year: 365 * 24 * 60 * 60 * 1000,
        };

        return achievementJar.filter(achievement => {
            return now - achievement.date <= timeRanges[timeFilter];
        });
    }, [achievementJar, timeFilter]);

    const handleAddAchievement = (achievementData) => {
        addAchievement(achievementData);
        setShowAddModal(false);
    };

    const handleEditAchievement = (achievementData) => {
        updateAchievement(editingAchievement.id, achievementData);
        setEditingAchievement(null);
        setShowAddModal(false);
    };

    const handleDeleteAchievement = (id) => {
        deleteAchievement(id);
        setShowDetailModal(false);
        setSelectedAchievement(null);
    };

    const openDetailModal = (achievement) => {
        setSelectedAchievement(achievement);
        setShowDetailModal(true);
    };

    const openEditModal = (achievement) => {
        setEditingAchievement(achievement);
        setShowAddModal(true);
        setShowDetailModal(false);
    };

    return (
        <div className="space-y-6 animate-in">
            {/* Header — Warrior Forge Panel */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(160deg, rgba(18,8,8,0.96) 0%, rgba(10,5,5,0.98) 100%)',
                    border: '1px solid rgba(192,36,42,0.30)',
                    borderRadius: 14,
                    padding: '28px 32px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Forge grid texture */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(192,36,42,0.04) 23px,rgba(192,36,42,0.04) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(192,36,42,0.04) 23px,rgba(192,36,42,0.04) 24px)',
                }} />
                {/* Top crimson accent line */}
                <div style={{
                    position: 'absolute', top: 0, left: '10%', right: '10%', height: 2,
                    background: 'linear-gradient(90deg, transparent, #c0242a, transparent)',
                    boxShadow: '0 0 18px rgba(192,36,42,0.7)',
                }} />

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                    {/* Left: title + counter */}
                    <div>
                        {/* Title row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                            {/* Trophy — slow heavy pendulum, not cartoon spin */}
                            <motion.div
                                animate={{ rotate: [-6, 6, -6] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    width: 52, height: 52, borderRadius: '50%',
                                    background: 'linear-gradient(145deg, #4a3010, #9a7030)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
                                    flexShrink: 0,
                                }}
                            >
                                <FontAwesomeIcon icon={faTrophy} style={{ fontSize: 22, color: '#c8943a', filter: 'drop-shadow(0 0 8px rgba(200,148,58,0.6))' }} />
                            </motion.div>
                            <div>
                                <h1 style={{
                                    fontFamily: "'Teko', sans-serif",
                                    fontSize: '2.6rem', fontWeight: 700, lineHeight: 1,
                                    background: 'linear-gradient(135deg, #c0242a 0%, #e05028 50%, #c8943a 100%)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    letterSpacing: '0.06em', marginBottom: 2,
                                }}>
                                    ACHIEVEMENTS RESUME
                                </h1>
                                <p style={{ color: 'rgba(160,120,100,0.65)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    Forge your legacy. Every win is forged in iron.
                                </p>
                            </div>
                        </div>

                        {/* Achievement counter — masculine war-badge style */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                            <motion.div
                                key={filteredAchievements.length}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    background: 'linear-gradient(135deg, rgba(192,36,42,0.20), rgba(140,20,20,0.10))',
                                    border: '1px solid rgba(192,36,42,0.40)',
                                    borderRadius: 8, padding: '6px 14px',
                                    boxShadow: '0 0 20px rgba(192,36,42,0.18)',
                                }}
                            >
                                <FontAwesomeIcon icon={faMedal} style={{ color: '#c8943a', fontSize: 13 }} />
                                <span style={{
                                    fontFamily: "'Teko', sans-serif",
                                    fontSize: '1.6rem', fontWeight: 700, lineHeight: 1,
                                    color: '#c0242a', letterSpacing: '0.04em',
                                    WebkitTextFillColor: '#c0242a',
                                }}>{filteredAchievements.length}</span>
                                <span style={{ fontSize: 11, color: 'rgba(180,140,120,0.70)', letterSpacing: '0.10em', textTransform: 'uppercase', WebkitTextFillColor: 'rgba(180,140,120,0.70)' }}>
                                    {filteredAchievements.length === 1 ? 'Victory' : 'Victories'} Forged
                                </span>
                            </motion.div>
                            {achievementJar.filter(a => a.isPriority).length > 0 && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(200,148,58,0.10)',
                                    border: '1px solid rgba(200,148,58,0.35)',
                                    borderRadius: 8, padding: '6px 12px',
                                }}>
                                    <FontAwesomeIcon icon={faCrown} style={{ color: '#c8943a', fontSize: 11 }} />
                                    <span style={{ fontSize: 11, color: 'rgba(200,148,58,0.80)', letterSpacing: '0.08em', textTransform: 'uppercase', WebkitTextFillColor: 'rgba(200,148,58,0.80)' }}>
                                        {achievementJar.filter(a => a.isPriority).length} Priority
                                    </span>
                                </div>
                            )}
                            {achievementJar.filter(a => a.fromChallenge).length > 0 && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(192,36,42,0.08)',
                                    border: '1px solid rgba(192,36,42,0.28)',
                                    borderRadius: 8, padding: '6px 12px',
                                }}>
                                    <FontAwesomeIcon icon={faFire} style={{ color: '#c0242a', fontSize: 11 }} />
                                    <span style={{ fontSize: 11, color: 'rgba(192,80,60,0.80)', letterSpacing: '0.08em', textTransform: 'uppercase', WebkitTextFillColor: 'rgba(192,80,60,0.80)' }}>
                                        {achievementJar.filter(a => a.fromChallenge).length} Conquered
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Add button */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { setEditingAchievement(null); setShowAddModal(true); }}
                        style={{
                            background: 'linear-gradient(135deg, #8b1a1a, #c0242a)',
                            border: '1px solid rgba(192,36,42,0.55)',
                            borderRadius: 10,
                            padding: '12px 22px',
                            color: '#fff', WebkitTextFillColor: '#fff',
                            fontFamily: "'Teko', sans-serif",
                            fontSize: '1.2rem', fontWeight: 700,
                            letterSpacing: '0.10em', textTransform: 'uppercase',
                            display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: '0 4px 24px rgba(192,36,42,0.40)',
                            cursor: 'pointer',
                            flexShrink: 0,
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14 }} />
                        Add Achievement
                    </motion.button>
                </div>
            </motion.div>

            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-4"
            >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('floating')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                viewMode === 'floating'
                                    ? 'bg-fire-orange text-white shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Floating View
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-fire-orange text-white shadow-lg'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Grid View
                        </button>
                    </div>

                    {/* Time Filter */}
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-fire-orange transition-colors"
                        >
                            <option value="all">All Time</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Empty State */}
            {filteredAchievements.length === 0 && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    background: 'linear-gradient(160deg, rgba(14,6,6,0.95), rgba(8,4,4,0.98))',
                    border: '1px solid rgba(192,36,42,0.22)',
                    borderRadius: 14, padding: '64px 32px',
                    textAlign: 'center',
                }}
            >
                <motion.div
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        width: 96, height: 96, borderRadius: '50%',
                        background: 'linear-gradient(145deg, #4a3010, #9a7030)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 0 40px rgba(200,148,58,0.35), 0 8px 32px rgba(0,0,0,0.8)',
                    }}
                >
                    <FontAwesomeIcon icon={faTrophy} style={{ fontSize: 42, color: '#c8943a', filter: 'drop-shadow(0 0 10px rgba(200,148,58,0.7))' }} />
                </motion.div>
                <h3 style={{ fontFamily: "'Teko', sans-serif", fontSize: '2rem', color: '#c0242a', WebkitTextFillColor: '#c0242a', letterSpacing: '0.06em', marginBottom: 8 }}>
                    THE RESUME IS EMPTY
                </h3>
                <p style={{ color: 'rgba(160,120,100,0.65)', fontSize: 13, letterSpacing: '0.04em', marginBottom: 28, maxWidth: 360, margin: '0 auto 28px' }}>
                    No victories yet. Every legend starts with a single act of courage.
                </p>
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setEditingAchievement(null); setShowAddModal(true); }}
                    style={{
                        background: 'linear-gradient(135deg, #8b1a1a, #c0242a)',
                        border: '1px solid rgba(192,36,42,0.5)',
                        borderRadius: 10, padding: '13px 28px',
                        color: '#fff', WebkitTextFillColor: '#fff',
                        fontFamily: "'Teko', sans-serif",
                        fontSize: '1.2rem', fontWeight: 700,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 4px 24px rgba(192,36,42,0.4)',
                        cursor: 'pointer',
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Forge Your First Victory
                </motion.button>
            </motion.div>
            )}

            {/* Achievements Display */}
            {filteredAchievements.length > 0 && (
                <>
                    {viewMode === 'floating' ? (
                        <FloatingAchievements
                            achievements={filteredAchievements}
                            onAchievementClick={openDetailModal}
                        />
                    ) : (
                        <GridAchievements
                            achievements={filteredAchievements}
                            onAchievementClick={openDetailModal}
                        />
                    )}
                </>
            )}

            {/* Add/Edit Achievement Modal */}
            <AchievementFormModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingAchievement(null);
                }}
                onSave={editingAchievement ? handleEditAchievement : handleAddAchievement}
                initialData={editingAchievement}
            />

            {/* Achievement Detail Modal */}
            <AchievementDetailModal
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedAchievement(null);
                }}
                achievement={selectedAchievement}
                onEdit={openEditModal}
                onDelete={handleDeleteAchievement}
            />
        </div>
    );
}

// ── Floating Achievements container ───────────────────────────────────────────
function FloatingAchievements({ achievements, onAchievementClick }) {
    const containerRef = useRef(null);
    // Cache container dimensions — read once via ResizeObserver, NOT per-frame per-badge
    const dimRef = useRef({ w: 800, h: 640 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            for (const e of entries) {
                dimRef.current = { w: e.contentRect.width, h: e.contentRect.height };
            }
        });
        ro.observe(el);
        // Set initial dims immediately
        dimRef.current = { w: el.offsetWidth, h: el.offsetHeight };
        return () => ro.disconnect();
    }, []);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="glass-panel relative"
            style={{ minHeight: '640px', overflow: 'hidden', isolation: 'isolate', contain: 'layout style' }}
        >
            {/* Dark armory background */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(160deg,#070707 0%,#0e0e0e 100%)',
            }} />
            {/* Subtle forge grid texture */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.018) 39px,rgba(255,255,255,0.018) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.018) 39px,rgba(255,255,255,0.018) 40px)',
            }} />
            {/* Vignette */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
            }} />

            {achievements.map((achievement, index) => (
                <FloatingBadge
                    key={achievement.id}
                    achievement={achievement}
                    index={index}
                    dimRef={dimRef}
                    onClick={() => onAchievementClick(achievement)}
                />
            ))}
        </motion.div>
    );
}

// ── Floating Physics Badge ─────────────────────────────────────────────────────
function FloatingBadge({ achievement, index, dimRef, onClick }) {
    const id          = achievement.id;
    const isChallenge = !!achievement.fromChallenge;
    const isPriority  = !!achievement.isPriority;
    const icon        = isChallenge ? faCrown : achievementIcons[achievement.iconIndex || 0];
    const theme       = isChallenge ? CHALLENGE_THEME : MEDAL_THEMES[(achievement.colorIndex || 0) % MEDAL_THEMES.length];
    const phaseOffset = useMemo(() => index * 2.399, [index]); // golden ratio, unique per badge

    const initialized = useRef(false);
    const [hovered, setHovered] = useState(false);

    const x = useMotionValue(-999);
    const y = useMotionValue(-999);
    // No rotation — badges drift/float, never spin

    // Register in shared physics world
    useEffect(() => {
        globalPhysics.set(id, {
            x: -999, y: -999,
            vx: (Math.random() - 0.5) * MAX_SPEED * 1.6,
            vy: (Math.random() - 0.5) * MAX_SPEED * 1.6,
        });
        return () => globalPhysics.delete(id);
    }, [id]);

    useAnimationFrame((_t, delta) => {
        if (hovered) return;
        // Use cached dimensions from parent ResizeObserver — NO layout reflow
        const { w: W, h: H } = dimRef.current;
        if (!W || !H) return;
        const state = globalPhysics.get(id);
        if (!state) return;

        // First frame: place badge randomly inside container
        if (!initialized.current) {
            state.x = BADGE_SIZE + Math.random() * (W - BADGE_SIZE * 3);
            state.y = BADGE_SIZE + Math.random() * (H - BADGE_SIZE * 3);
            initialized.current = true;
            x.set(state.x);
            y.set(state.y);
            return;
        }

        const dt = Math.min(delta, 50) / 16;

        let nx = state.x + state.vx * dt;
        let ny = state.y + state.vy * dt;

        // ── Badge-badge collision ──────────────────────────────────────────────
        const R = BADGE_SIZE * 0.52; // collision radius (slightly inset)
        for (const [otherId, other] of globalPhysics) {
            if (otherId === id || other.x === -999) continue;
            const ddx  = nx - other.x;
            const ddy  = ny - other.y;
            const dist = Math.hypot(ddx, ddy);
            const minD = R * 2;
            if (dist < minD && dist > 0.01) {
                const nx_ = ddx / dist;
                const ny_ = ddy / dist;
                // Relative velocity along collision normal
                const dvn = (state.vx - other.vx) * nx_ + (state.vy - other.vy) * ny_;
                if (dvn < 0) { // only if approaching
                    const restitution = 0.20; // soft, slow bounce
                    const imp = -(1 + restitution) * dvn * 0.45;
                    state.vx += imp * nx_;
                    state.vy += imp * ny_;
                }
                // Gently push apart to prevent clumping
                const overlap = (minD - dist) * 0.12 * dt;
                nx += nx_ * overlap;
                ny += ny_ * overlap;
            }
        }

        // ── Soft center-pull (keeps most time inside) ─────────────────────────
        const pullZone = Math.max(W, H) * 0.42;
        const cx   = W * 0.5 - BADGE_SIZE * 0.5;
        const cy   = H * 0.5 - BADGE_SIZE * 0.5;
        const ddx2 = cx - nx;
        const ddy2 = cy - ny;
        const d2   = Math.hypot(ddx2, ddy2);
        if (d2 > pullZone && d2 > 0) {
            const pull = 0.010 * ((d2 - pullZone) / pullZone) * dt;
            state.vx  += (ddx2 / d2) * pull;
            state.vy  += (ddy2 / d2) * pull;
        }

        // ── Speed limits ──────────────────────────────────────────────────────
        let speed = Math.hypot(state.vx, state.vy);
        if (speed > MAX_SPEED) {
            state.vx = (state.vx / speed) * MAX_SPEED;
            state.vy = (state.vy / speed) * MAX_SPEED;
            speed    = MAX_SPEED;
        }
        // Keep badge moving — never fully stop
        if (speed < MIN_SPEED) {
            const angle = Math.random() * Math.PI * 2;
            state.vx = Math.cos(angle) * MIN_SPEED;
            state.vy = Math.sin(angle) * MIN_SPEED;
        }

        // ── Tiny random perturbation for organic drift ────────────────────────
        if (Math.random() < 0.003) {
            state.vx += (Math.random() - 0.5) * 0.12;
            state.vy += (Math.random() - 0.5) * 0.12;
        }

        // ── Smooth edge wrap: only wrap after badge is FULLY outside ──────────
        // This lets the badge visibly slide through the edge before reappearing.
        const EXIT = BADGE_SIZE * 1.05;
        if (nx < -EXIT)       nx = W + EXIT * 0.08;
        else if (nx > W + EXIT) nx = -EXIT * 0.08;
        if (ny < -EXIT)       ny = H + EXIT * 0.08;
        else if (ny > H + EXIT) ny = -EXIT * 0.08;

        // No rotation — just drift
        state.x = nx; state.y = ny;
        x.set(nx); y.set(ny);
    });

    return (
        <motion.div
            style={{
                position: 'absolute', width: BADGE_SIZE, height: BADGE_SIZE,
                x, y,
                zIndex: hovered ? 40 : 10,
                cursor: 'pointer',
                willChange: 'transform',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: index * 0.10, type: 'spring', bounce: 0.15 }}
            whileHover={{ scale: 1.18 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={onClick}
        >
            {/* Under-glow — valid rgba box-shadow using pre-extracted rgb string */}
            <div style={{
                position: 'absolute', inset: -10, borderRadius: '50%',
                boxShadow: isChallenge
                    ? `0 0 32px 12px rgba(${CHALLENGE_THEME.gr},${hovered ? 0.60 : 0.38})`
                    : isPriority
                    ? `0 0 28px 10px rgba(${theme.gr},${hovered ? 0.65 : 0.48})`
                    : `0 0 18px 5px rgba(${theme.gr},${hovered ? 0.45 : 0.18})`,
                transition: 'box-shadow 0.45s ease',
                pointerEvents: 'none',
            }} />

            {/* Priority outer gold ring — visually distinct from non-priority */}
            {isPriority && !isChallenge && (
                <div style={{
                    position: 'absolute', inset: -3, borderRadius: '50%',
                    border: `2px solid rgba(200,148,58,${hovered ? 0.85 : 0.55})`,
                    boxShadow: `0 0 10px rgba(200,148,58,${hovered ? 0.5 : 0.25})`,
                    transition: 'all 0.45s ease',
                    pointerEvents: 'none',
                }} />
            )}

            {/* Outer medal ring — metallic gradient */}
            <div style={{
                position:'absolute', inset:0, borderRadius:'50%',
                background: theme.o,
                boxShadow: [
                    'inset 0 2px 5px rgba(255,255,255,0.14)',
                    'inset 0 -2px 5px rgba(0,0,0,0.65)',
                    '0 8px 28px rgba(0,0,0,0.9)',
                    '0 2px 6px rgba(0,0,0,0.7)',
                ].join(','),
            }} />

            {/* Inner medal face — dark recess */}
            <div style={{
                position:'absolute', inset:7, borderRadius:'50%',
                background: theme.i,
                boxShadow:'inset 0 2px 8px rgba(0,0,0,0.85), inset 0 -1px 2px rgba(255,255,255,0.03)',
            }} />

            {/* Engraving detail ring */}
            <div style={{
                position:'absolute', inset:11, borderRadius:'50%',
                border: `1px solid rgba(255,255,255,${isChallenge ? '0.14' : '0.06'})`,
            }} />

            {/* Challenge: second gold detail ring */}
            {isChallenge && (
                <div style={{ position:'absolute', inset:15, borderRadius:'50%', border:'1px solid rgba(200,160,20,0.2)' }} />
            )}

            {/* Icon — uses theme icon color properly */}
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FontAwesomeIcon
                    icon={icon}
                    style={{
                        fontSize: isChallenge ? 26 : 22,
                        color: theme.ic,
                        opacity: 0.92,
                        filter: `drop-shadow(0 2px 5px rgba(0,0,0,0.95)) drop-shadow(0 0 ${hovered ? 10 : 4}px rgba(${theme.gr},0.8))`,
                        transition: 'filter 0.5s ease',
                    }}
                />
            </div>

            {/* Tooltip */}
            <motion.div
                style={{ position:'absolute', left:'50%', top:'108%', translateX:'-50%', pointerEvents:'none', originX:'50%', originY:0, whiteSpace:'nowrap' }}
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
                transition={{ duration: 0.14 }}
            >
                <div style={{ background:'rgba(4,4,6,0.96)', border:'1px solid rgba(255,255,255,0.09)', color:'#a0a0a0', fontSize:10, padding:'3px 9px', borderRadius:5, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:700 }}>
                    {achievement.title}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Grid Achievements Component
function GridAchievements({ achievements, onAchievementClick }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {achievements.map((achievement, index) => (
                <GridAchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    index={index}
                    onClick={() => onAchievementClick(achievement)}
                />
            ))}
        </motion.div>
    );
}

// Grid Achievement Card
function GridAchievementCard({ achievement, index, onClick }) {
    const icon = achievementIcons[achievement.iconIndex || 0];
    const colorClass = achievementColors[achievement.colorIndex || 0];
    const date = new Date(achievement.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="glass-panel p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden depth-2"
        >
            {/* Background gradient - MASCULINE */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10 group-hover:opacity-20 transition-opacity steel-overlay`}></div>

            <div className="relative z-10">
                {/* Icon with 3D effect */}
                <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className={`w-16 h-16 bg-gradient-to-br ${colorClass} shadow-lg flex items-center justify-center mb-4 transition-transform animate-float relative overflow-hidden`}
                    style={{ borderRadius: '4px' }}>
                    <FontAwesomeIcon icon={icon} className="text-2xl text-white drop-shadow-lg relative z-10" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-fire-orange transition-colors">
                    {achievement.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {achievement.description}
                </p>

                {/* Date */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2 text-xs text-gray-500"
                >
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>{date}</span>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Achievement Form Modal
function AchievementFormModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        iconIndex: 0,
        colorIndex: 0,
        isPriority: false,
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                iconIndex: initialData.iconIndex || 0,
                colorIndex: initialData.colorIndex || 0,
                isPriority: initialData.isPriority || false,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                iconIndex: 0,
                colorIndex: 0,
                isPriority: false,
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        onSave({
            ...formData,
            date: initialData?.date || Date.now(),
        });

        setFormData({ title: '', description: '', iconIndex: 0, colorIndex: 0, isPriority: false });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Achievement' : 'Add New Achievement'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Achievement Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Completed my first marathon"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange transition-colors"
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your achievement and how it made you feel..."
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-fire-orange transition-colors resize-none"
                    />
                </div>

                {/* PRIORITY TOGGLE */}
                <div
                    onClick={() => setFormData({ ...formData, isPriority: !formData.isPriority })}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', userSelect: 'none',
                        background: formData.isPriority ? 'rgba(192,36,42,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${formData.isPriority ? 'rgba(192,36,42,0.50)' : 'rgba(255,255,255,0.10)'}`,
                        borderRadius: '12px', padding: '14px 16px',
                        transition: 'all 0.25s ease',
                        boxShadow: formData.isPriority ? '0 0 20px rgba(192,36,42,0.25)' : 'none',
                    }}
                >
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: formData.isPriority ? '#e08060' : '#aaa', marginBottom: 2 }}>
                            ⚔️ Mark as Priority Achievement
                        </p>
                        <p style={{ fontSize: '11px', color: formData.isPriority ? 'rgba(200,148,58,0.80)' : 'rgba(120,120,120,0.7)' }}>
                            Priority achievements glow brighter in the Vault
                        </p>
                    </div>
                    <div style={{
                        width: 44, height: 24, borderRadius: 12,
                        background: formData.isPriority
                            ? 'linear-gradient(90deg, #8b1a1a, #c0242a)'
                            : 'rgba(60,40,40,0.8)',
                        border: `1px solid ${formData.isPriority ? 'rgba(192,36,42,0.6)' : 'rgba(80,60,60,0.5)'}`,
                        position: 'relative', transition: 'all 0.25s ease',
                        flexShrink: 0,
                        boxShadow: formData.isPriority ? '0 0 12px rgba(192,36,42,0.5)' : 'none',
                    }}>
                        <div style={{
                            position: 'absolute', top: 2,
                            left: formData.isPriority ? 22 : 2,
                            width: 18, height: 18, borderRadius: '50%',
                            background: formData.isPriority ? '#fff' : 'rgba(140,100,100,0.8)',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        }} />
                    </div>
                </div>

                {/* Icon Selection */}
                <div>
                    <label className="block text-sm font-semibold mb-3">Choose Icon</label>
                    <div className="grid grid-cols-5 gap-3">
                        {achievementIcons.map((icon, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setFormData({ ...formData, iconIndex: index })}
                                className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${
                                    formData.iconIndex === index
                                        ? 'bg-fire-orange text-white shadow-lg scale-110'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                                <FontAwesomeIcon icon={icon} className="text-2xl" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Color Selection */}
                <div>
                    <label className="block text-sm font-semibold mb-3">Choose Color</label>
                    <div className="grid grid-cols-4 gap-3">
                        {achievementColors.map((colorClass, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setFormData({ ...formData, colorIndex: index })}
                                className={`w-full aspect-square rounded-xl bg-gradient-to-br ${colorClass} transition-all ${
                                    formData.colorIndex === index
                                        ? 'ring-4 ring-white scale-110'
                                        : 'hover:scale-105'
                                }`}
                            >
                                {formData.colorIndex === index && (
                                    <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div className="glass-panel p-4">
                    <p className="text-xs text-gray-400 mb-3">Preview</p>
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${achievementColors[formData.colorIndex]} shadow-lg flex items-center justify-center`}>
                            <FontAwesomeIcon icon={achievementIcons[formData.iconIndex]} className="text-2xl text-white" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold">{formData.title || 'Your Achievement'}</h4>
                            <p className="text-sm text-gray-400 line-clamp-2">{formData.description || 'Description will appear here'}</p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-3 rounded-xl transition-colors font-semibold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-fire-orange to-fire-red text-white px-6 py-3 rounded-xl hover:shadow-[0_0_30px_rgba(255,94,0,0.5)] transition-all font-semibold"
                    >
                        {initialData ? 'Update' : 'Add'} Achievement
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// Achievement Detail Modal
function AchievementDetailModal({ isOpen, onClose, achievement, onEdit, onDelete }) {
    const [confirmDel, setConfirmDel] = React.useState(false);
    if (!achievement) return null;

    const isChallenge = !!achievement.fromChallenge;
    const icon = achievementIcons[achievement.iconIndex || 0];
    const colorClass = achievementColors[achievement.colorIndex || 0];
    const date = new Date(achievement.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <Modal isOpen={isOpen} onClose={() => { setConfirmDel(false); onClose(); }}>
            <div className="space-y-6">
                {/* Icon and Title */}
                <div className="text-center">
                    {/* Badge icon — gem ring for challenge achievements */}
                    <div className="relative w-32 h-32 mx-auto mb-6" style={{ display: 'inline-block' }}>
                        {isChallenge && (
                            <div style={{
                                position: 'absolute', inset: -6,
                                borderRadius: '50%',
                                background: 'conic-gradient(from 0deg, #a855f7, #f59e0b, #a855f7, #7c3aed, #f59e0b, #a855f7)',
                                animation: 'spin 4s linear infinite',
                                zIndex: 0,
                            }} />
                        )}
                        <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${colorClass} shadow-2xl flex items-center justify-center relative overflow-hidden`}
                            style={{
                                position: 'relative', zIndex: 1,
                                boxShadow: isChallenge
                                    ? '0 0 30px rgba(168,85,247,0.5), 0 0 60px rgba(245,158,11,0.3)'
                                    : undefined,
                            }}>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                            <FontAwesomeIcon icon={icon} className="text-5xl text-white relative z-10" />
                            {isChallenge && (
                                <div style={{
                                    position: 'absolute', top: 4, right: 4,
                                    background: 'rgba(168,85,247,0.9)',
                                    borderRadius: 4, padding: '1px 4px',
                                    fontSize: 9, fontWeight: 700, color: 'white',
                                    letterSpacing: '0.06em',
                                }}>💎 CHALLENGE</div>
                            )}
                        </div>
                    </div>
                    <h2 className="header-font text-3xl fire-text mb-2">{achievement.title}</h2>
                    {isChallenge && (
                        <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">
                            ⚔️ Challenge Conquest
                        </p>
                    )}
                    <p className="text-gray-400 flex items-center gap-2 justify-center">
                        <FontAwesomeIcon icon={faCalendar} />
                        {date}
                    </p>
                </div>

                {/* Description */}
                {achievement.description && (
                    <div className="glass-panel p-6">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {achievement.description}
                        </p>
                    </div>
                )}

                {/* Motivational Quote */}
                <div className={`glass-panel p-6 bg-gradient-to-br ${
                    isChallenge
                        ? 'from-purple-900/30 to-amber-900/20 border-purple-500/30'
                        : 'from-fire-orange/10 to-fire-red/10 border-fire-orange/30'
                }`}>
                    <p className="text-center italic text-gray-300">
                        {isChallenge
                            ? '"You didn\'t miss a single day. That is what separates warriors from everyone else."'
                            : '"Remember this moment when you need strength. You\'ve done it before, you can do it again."'
                        }
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {!isChallenge && (
                        <button
                            onClick={() => onEdit(achievement)}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>
                    )}
                    {!confirmDel ? (
                        <button
                            onClick={() => setConfirmDel(true)}
                            className="flex-1 bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                    ) : (
                        <div className="flex-1 flex gap-2">
                            <button
                                onClick={() => setConfirmDel(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-3 rounded-xl font-semibold transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setConfirmDel(false); onDelete(achievement.id); }}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-1"
                            >
                                <FontAwesomeIcon icon={faTrash} /> Confirm
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}