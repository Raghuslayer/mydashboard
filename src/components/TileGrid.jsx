import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlay, faList, faPen, faTrash, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import TaskFormModal from './TaskFormModal';

export default function TileGrid({ items, tabId, isRoutine, checkedStates, onTileClick, isEditable, onAddTask, onEditTask, onDeleteTask }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Task form modal state
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Delete confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const handleClick = (index, item) => {
        // If routine, toggle check
        if (isRoutine) {
            onTileClick(index, item);
        }

        // If has video or context, also show modal
        if (item.videoUrl || item.contextItems) {
            setSelectedItem(item);
            setShowModal(true);
        }
    };

    const handleEditClick = (e, item) => {
        e.stopPropagation();
        setEditingTask(item);
        setShowTaskForm(true);
    };

    const handleDeleteClick = (e, item) => {
        e.stopPropagation();
        setTaskToDelete(item);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (taskToDelete && onDeleteTask) {
            onDeleteTask(taskToDelete.id);
        }
        setShowDeleteConfirm(false);
        setTaskToDelete(null);
    };

    const handleSaveTask = (taskData) => {
        if (editingTask) {
            // Editing existing task
            if (onEditTask) {
                onEditTask(editingTask.id, taskData);
            }
        } else {
            // Adding new task
            if (onAddTask) {
                onAddTask(taskData);
            }
        }
        setEditingTask(null);
    };

    const handleAddNewClick = () => {
        setEditingTask(null);
        setShowTaskForm(true);
    };

    // Helper to get checked state for task (supports both ID and index)
    const getCheckedState = (item, index) => {
        if (item.id && typeof checkedStates === 'object' && !Array.isArray(checkedStates)) {
            return checkedStates[item.id] || false;
        }
        return checkedStates[index] || false;
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in">
                {items.map((item, index) => {
                    const isChecked = getCheckedState(item, index);
                    const hasVideo = !!item.videoUrl;
                    const hasContext = !!item.contextItems;

                    return (
                        <div
                            key={item.id || index}
                            onClick={() => handleClick(item.id || index, item)}
                            className={`tile group relative h-48 rounded-2xl overflow-hidden cursor-pointer ${isChecked ? 'opacity-50 grayscale' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                {item.thumbnail && (
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                )}
                                <div className={`absolute inset-0 bg-gradient-to-t ${isChecked ? 'from-green-900/90 to-black/60' : 'from-black/90 via-black/50 to-transparent'}`}></div>
                            </div>

                            {/* Check Overlay */}
                            {isChecked && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                                        <FontAwesomeIcon icon={faCheck} className="text-white text-xl" />
                                    </div>
                                </div>
                            )}

                            {/* Edit/Delete Buttons (for editable tabs) */}
                            {isEditable && (
                                <div className="absolute top-4 left-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleEditClick(e, item)}
                                        className="bg-blue-600 hover:bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors"
                                        title="Edit task"
                                    >
                                        <FontAwesomeIcon icon={faPen} className="text-white text-xs" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, item)}
                                        className="bg-red-600 hover:bg-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors"
                                        title="Delete task"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-white text-xs" />
                                    </button>
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                {hasVideo && <div className="bg-red-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"><FontAwesomeIcon icon={faPlay} className="text-white text-xs" /></div>}
                                {hasContext && <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"><FontAwesomeIcon icon={faList} className="text-white text-xs" /></div>}
                            </div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 w-full p-6 z-10">
                                <h3 className={`header-font text-2xl leading-none mb-1 ${isChecked ? 'text-green-400 line-through' : 'text-white group-hover:text-fire-yellow'}`}>
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-400 font-light line-clamp-2 group-hover:text-gray-200 transition-colors">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {/* Add New Task Tile (for editable tabs) */}
                {isEditable && (
                    <div
                        onClick={handleAddNewClick}
                        className="tile group relative h-48 rounded-2xl overflow-hidden cursor-pointer border-2 border-dashed border-white/20 hover:border-fire-orange/50 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-fire-orange/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-fire-orange/30 transition-colors">
                                <FontAwesomeIcon icon={faPlus} className="text-fire-orange text-2xl group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="header-font text-xl text-white/70 group-hover:text-fire-orange transition-colors">
                                Add New Task
                            </h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Video/Context Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedItem?.title}>
                {selectedItem?.videoUrl && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-black">
                        <video
                            src={selectedItem.videoUrl}
                            controls
                            autoPlay
                            className="w-full h-full"
                        />
                    </div>
                )}

                {selectedItem?.description && (
                    <p className="text-lg text-gray-300 mb-6 font-light">{selectedItem.description}</p>
                )}

                {selectedItem?.contextItems && (
                    <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-3">Checklist / Details</h4>
                        <ul className="space-y-2">
                            {selectedItem.contextItems.map((item, i) => (
                                <li key={i} className="flex items-center text-gray-300 text-sm">
                                    <span className="w-1.5 h-1.5 bg-fire-orange rounded-full mr-3"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>

            {/* Task Form Modal */}
            <TaskFormModal
                isOpen={showTaskForm}
                onClose={() => {
                    setShowTaskForm(false);
                    setEditingTask(null);
                }}
                onSave={handleSaveTask}
                initialData={editingTask}
                mode={editingTask ? 'edit' : 'add'}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setTaskToDelete(null);
                }}
                title="Confirm Delete"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-3xl" />
                    </div>
                    <h3 className="text-xl text-white mb-2">Delete this task?</h3>
                    <p className="text-gray-400 mb-6">
                        "{taskToDelete?.title}" will be permanently removed. This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setTaskToDelete(null);
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-3 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
