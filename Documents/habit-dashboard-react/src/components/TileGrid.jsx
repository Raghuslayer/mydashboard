import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlay, faList } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';

export default function TileGrid({ items, tabId, isRoutine, checkedStates, onTileClick }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in">
                {items.map((item, index) => {
                    const isChecked = checkedStates[index] || false;
                    const hasVideo = !!item.videoUrl;
                    const hasContext = !!item.contextItems;

                    return (
                        <div
                            key={index}
                            onClick={() => handleClick(index, item)}
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
            </div>

            {/* Modal for Video/Context */}
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
        </>
    );
}
