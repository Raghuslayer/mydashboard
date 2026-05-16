export const TIERS = [
    { minLevel: 100, name: "Immortal",     color: "#ff0000", bg: "from-red-600 to-black" },
    { minLevel: 90,  name: "Legend",       color: "#f59e0b", bg: "from-yellow-500 to-orange-600" },
    { minLevel: 80,  name: "Grandmaster",  color: "#d946ef", bg: "from-fuchsia-500 to-purple-600" },
    { minLevel: 70,  name: "Master",       color: "#ec4899", bg: "from-pink-500 to-rose-600" },
    { minLevel: 60,  name: "Elite",        color: "#10b981", bg: "from-emerald-400 to-teal-500" },
    { minLevel: 50,  name: "Diamond",      color: "#0ea5e9", bg: "from-sky-400 to-blue-600" },
    { minLevel: 40,  name: "Platinum",     color: "#94a3b8", bg: "from-slate-300 to-slate-500" },
    { minLevel: 30,  name: "Gold",         color: "#eab308", bg: "from-yellow-400 to-yellow-600" },
    { minLevel: 20,  name: "Silver",       color: "#cbd5e1", bg: "from-gray-300 to-gray-500" },
    { minLevel: 10,  name: "Bronze",       color: "#b45309", bg: "from-amber-700 to-yellow-900" },
    { minLevel: 1,   name: "Recruit",      color: "#6b7280", bg: "from-gray-500 to-gray-700" }
];

export function getTierForLevel(level) {
    for (const tier of TIERS) {
        if (level >= tier.minLevel) {
            return tier;
        }
    }
    return TIERS[TIERS.length - 1]; // Default to Recruit
}
