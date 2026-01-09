import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faImage, faVideo, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export default function TaskFormModal({ isOpen, onClose, onSave, initialData, mode = 'add', tabType = 'routine' }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [contextItems, setContextItems] = useState('');
    const [icon, setIcon] = useState('');

    // Determine which fields to show based on tab type
    const showVideoUrl = ['vault', 'learning', 'morning', 'deepWork', 'night'].includes(tabType);
    const showThumbnail = !['vault'].includes(tabType); // Vault doesn't need thumbnail (video covers it)
    const showContextItems = ['morning', 'deepWork', 'night'].includes(tabType);
    const showIcon = ['learning', 'skills'].includes(tabType);

    // Reset form when modal opens with initial data
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || '');
            setDescription(initialData?.description || '');
            setThumbnail(initialData?.thumbnail || '');
            setVideoUrl(initialData?.videoUrl || '');
            setContextItems(initialData?.contextItems?.join('\n') || '');
            setIcon(initialData?.icon || '');
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const data = {
            title: title.trim(),
            description: description.trim(),
        };

        // Only include fields that have values
        if (thumbnail.trim()) data.thumbnail = thumbnail.trim();
        if (videoUrl.trim()) data.videoUrl = videoUrl.trim();
        if (contextItems.trim()) {
            data.contextItems = contextItems.trim().split('\n').filter(item => item.trim());
        }
        if (icon.trim()) data.icon = icon.trim();

        // Auto-generate thumbnail placeholder if not provided and not vault
        if (!data.thumbnail && tabType !== 'vault') {
            data.thumbnail = `https://placehold.co/600x400/2A0000/FF5E00?text=${encodeURIComponent(title.trim().substring(0, 15))}`;
        }

        onSave(data);

        // Reset form
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setThumbnail('');
        setVideoUrl('');
        setContextItems('');
        setIcon('');
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    const getModalTitle = () => {
        if (tabType === 'vault') return mode === 'add' ? 'Add Video' : 'Edit Video';
        if (tabType === 'learning') return mode === 'add' ? 'Add Learning Item' : 'Edit Learning Item';
        if (tabType === 'skills') return mode === 'add' ? 'Add Skill' : 'Edit Skill';
        return mode === 'add' ? 'Add New Task' : 'Edit Task';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title={getModalTitle()}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Title <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={tabType === 'vault' ? 'Video title...' : 'Enter title...'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fire-orange focus:outline-none focus:ring-1 focus:ring-fire-orange transition-colors"
                        autoFocus
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fire-orange focus:outline-none focus:ring-1 focus:ring-fire-orange transition-colors resize-none"
                    />
                </div>

                {/* Video URL */}
                {showVideoUrl && (
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            <FontAwesomeIcon icon={faVideo} className="mr-2 text-red-400" />
                            Video URL {tabType === 'vault' && <span className="text-red-400">*</span>}
                        </label>
                        <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fire-orange focus:outline-none focus:ring-1 focus:ring-fire-orange transition-colors"
                            required={tabType === 'vault'}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                            Supports MP4, WebM, or Cloudinary URLs
                        </p>
                    </div>
                )}

                {/* Thumbnail URL */}
                {showThumbnail && (
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            <FontAwesomeIcon icon={faImage} className="mr-2" />
                            Thumbnail URL (optional)
                        </label>
                        <input
                            type="url"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fire-orange focus:outline-none focus:ring-1 focus:ring-fire-orange transition-colors"
                        />
                        {thumbnail && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-white/10 h-20">
                                <img
                                    src={thumbnail}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Context Items (for routine tasks) */}
                {showContextItems && (
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Checklist Items (one per line, optional)
                        </label>
                        <textarea
                            value={contextItems}
                            onChange={(e) => setContextItems(e.target.value)}
                            placeholder="Item 1&#10;Item 2&#10;Item 3"
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fire-orange focus:outline-none focus:ring-1 focus:ring-fire-orange transition-colors resize-none font-mono text-sm"
                        />
                    </div>
                )}

                {/* Icon (for learning/skills) */}
                {showIcon && (
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Icon Name (FontAwesome)
                        </label>
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            placeholder="faCode, faBrain, faBookOpen..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fire-orange focus:outline-none focus:ring-1 focus:ring-fire-orange transition-colors"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!title.trim() || (tabType === 'vault' && !videoUrl.trim())}
                        className="flex-1 bg-gradient-to-r from-fire-orange to-fire-red hover:from-fire-yellow hover:to-fire-orange disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold"
                    >
                        <FontAwesomeIcon icon={faSave} />
                        {mode === 'add' ? 'Add' : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
