import React from 'react';
import { staticData } from '../data/staticData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default function SkillMap() {
    const skillMapData = staticData.skillMap || [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skillMapData.map((group, i) => (
                <div
                    key={i}
                    className="glass-panel p-6 border-l-4 border-fire-orange"
                    style={{ animationDelay: `${i * 0.1}s` }}
                >
                    <h3 className="header-font text-3xl text-white mb-2">{group.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 border-b border-gray-700 pb-2">{group.description}</p>
                    <ul className="space-y-3">
                        {group.items.map((skill, j) => (
                            <li key={j} className="flex items-center text-gray-300">
                                <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-3 text-sm" />
                                {skill}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
