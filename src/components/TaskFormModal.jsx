import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faImage } from '@fortawesome/free-solid-svg-icons';

export default function TaskFormModal({ isOpen, onClose, onSave, initialData, mode = 'add' }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState('');

    // Reset form when modal opens with initial data
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || '');
            setDescription(initialData?.description || '');
            setThumbnail(initialData?.thumbnail || '');
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            title: title.trim(),
            description: description.trim(),
            thumbnail: thumbnail.trim() || undefined
        });

        // Reset form
        setTitle('');
        setDescription('');
        setThumbnail('');
        onClose();
    };

    const handleCancel = () => {
        setTitle('');
        setDescription('');
        setThumbnail('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            title={mode === 'add' ? 'Add New Task' : 'Edit Task'}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Task Title <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter task title..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fire-orange focus:outline-none focus:ring-1 focus:ring-fire-orange transition-colors"
                        autoFocus
                        required
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        Description (optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of the task..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-fire-orange focus:outline-none focus:ring-1 focus:ring-fire-orange transition-colors resize-none"
                    />
                </div>

                {/* Thumbnail URL */}
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
                        <div className="mt-3 rounded-lg overflow-hidden border border-white/10 h-24">
                            <img
                                src={thumbnail}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}
                </div>

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
                        disabled={!title.trim()}
                        className="flex-1 bg-gradient-to-r from-fire-orange to-fire-red hover:from-fire-yellow hover:to-fire-orange disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold"
                    >
                        <FontAwesomeIcon icon={faSave} />
                        {mode === 'add' ? 'Add Task' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
