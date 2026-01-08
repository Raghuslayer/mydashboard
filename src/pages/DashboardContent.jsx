import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataProvider';
import TileGrid from '../components/TileGrid';
import { staticData, routineTabs } from '../data/staticData';

export default function DashboardContent() {
    const { tabId } = useParams();
    const { checkedStates, toggleRoutineTask } = useData();

    const items = staticData[tabId] || [];
    const isRoutine = routineTabs.includes(tabId);
    // Ensure tabStates is always an array (Firebase might store as object)
    const rawStates = checkedStates[tabId];
    const tabStates = Array.isArray(rawStates) ? rawStates : Object.values(rawStates || {});

    if (items.length === 0) {
        return (
            <div className="text-center text-gray-500 mt-20 glass-panel p-10">
                <h2 className="header-font text-3xl mb-4">Tab '{tabId}' Under Construction</h2>
                <p>This section is being built. Check back soon!</p>
            </div>
        );
    }

    const handleTileClick = (index, item) => {
        if (isRoutine) {
            const currentState = tabStates[index] || false;
            toggleRoutineTask(tabId, index, !currentState);
        }
        // For non-routine, could open modal for video/context
    };

    return (
        <TileGrid
            items={items}
            tabId={tabId}
            isRoutine={isRoutine}
            checkedStates={tabStates}
            onTileClick={handleTileClick}
        />
    );
}
