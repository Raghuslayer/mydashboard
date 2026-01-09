import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataProvider';
import TileGrid from '../components/TileGrid';
import { staticData, routineTabs } from '../data/staticData';

export default function DashboardContent() {
    const { tabId } = useParams();
    const {
        checkedStates,
        toggleRoutineTask,
        getRoutineTasks,
        addRoutineTask,
        updateRoutineTask,
        deleteRoutineTask,
        editableRoutineTabs
    } = useData();

    // Get items from custom routine tasks for editable tabs, static data for others
    const items = getRoutineTasks ? getRoutineTasks(tabId) : staticData[tabId] || [];
    const isRoutine = routineTabs.includes(tabId);
    const isEditable = editableRoutineTabs?.includes(tabId);

    // Get checked states for this tab
    const rawStates = checkedStates[tabId];
    // For editable tabs with ID-based tracking, use object directly
    // For legacy tabs, convert to array if needed
    const tabStates = isEditable
        ? (rawStates || {})
        : (Array.isArray(rawStates) ? rawStates : Object.values(rawStates || {}));

    if (items.length === 0 && !isEditable) {
        return (
            <div className="text-center text-gray-500 mt-20 glass-panel p-10">
                <h2 className="header-font text-3xl mb-4">Tab '{tabId}' Under Construction</h2>
                <p>This section is being built. Check back soon!</p>
            </div>
        );
    }

    const handleTileClick = (taskIdOrIndex, item) => {
        if (isRoutine) {
            const currentState = isEditable
                ? (tabStates[taskIdOrIndex] || false)
                : (tabStates[taskIdOrIndex] || false);
            toggleRoutineTask(tabId, taskIdOrIndex, !currentState);
        }
        // For non-routine, the modal is handled in TileGrid
    };

    const handleAddTask = (taskData) => {
        if (addRoutineTask) {
            addRoutineTask(tabId, taskData);
        }
    };

    const handleEditTask = (taskId, updatedData) => {
        if (updateRoutineTask) {
            updateRoutineTask(tabId, taskId, updatedData);
        }
    };

    const handleDeleteTask = (taskId) => {
        if (deleteRoutineTask) {
            deleteRoutineTask(tabId, taskId);
        }
    };

    return (
        <TileGrid
            items={items}
            tabId={tabId}
            isRoutine={isRoutine}
            isEditable={isEditable}
            checkedStates={tabStates}
            onTileClick={handleTileClick}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
        />
    );
}
