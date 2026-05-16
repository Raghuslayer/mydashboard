import { 
    faCrown, faFire, faSkull, faBolt, 
    faShieldHalved, faGem, faStar, faTrophy, 
    faMedal, faAward, faDumbbell 
} from '@fortawesome/free-solid-svg-icons';

export const TIERS = [
    { minLevel: 100, name: "Immortal",     icon: faCrown,        color: "#ff0000", bg: "from-red-600 to-black" },
    { minLevel: 90,  name: "Legend",       icon: faFire,         color: "#f59e0b", bg: "from-yellow-500 to-orange-600" },
    { minLevel: 80,  name: "Grandmaster",  icon: faSkull,        color: "#d946ef", bg: "from-fuchsia-500 to-purple-600" },
    { minLevel: 70,  name: "Master",       icon: faBolt,         color: "#ec4899", bg: "from-pink-500 to-rose-600" },
    { minLevel: 60,  name: "Elite",        icon: faShieldHalved, color: "#10b981", bg: "from-emerald-400 to-teal-500" },
    { minLevel: 50,  name: "Diamond",      icon: faGem,          color: "#0ea5e9", bg: "from-sky-400 to-blue-600" },
    { minLevel: 40,  name: "Platinum",     icon: faStar,         color: "#94a3b8", bg: "from-slate-300 to-slate-500" },
    { minLevel: 30,  name: "Gold",         icon: faTrophy,       color: "#eab308", bg: "from-yellow-400 to-yellow-600" },
    { minLevel: 20,  name: "Silver",       icon: faMedal,        color: "#cbd5e1", bg: "from-gray-300 to-gray-500" },
    { minLevel: 10,  name: "Bronze",       icon: faAward,        color: "#b45309", bg: "from-amber-700 to-yellow-900" },
    { minLevel: 1,   name: "Recruit",      icon: faDumbbell,     color: "#6b7280", bg: "from-gray-500 to-gray-700" }
];

export function getTierForLevel(level) {
    for (const tier of TIERS) {
        if (level >= tier.minLevel) {
            return tier;
        }
    }
    return TIERS[TIERS.length - 1]; // Default to Recruit
}
