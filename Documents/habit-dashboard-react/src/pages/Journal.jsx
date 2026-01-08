import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faBroom, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

export default function Journal() {
    const { journalEntries, addJournalEntry, clearJournalEntries } = useData();
    const [text, setText] = useState('');

    const handleSave = () => {
        if (text.trim()) {
            addJournalEntry(text.trim());
            setText('');
        }
    };

    return (
        <div className="glass-panel p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Section */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="header-font text-3xl text-white">Daily Journal</h3>
                        <span className="text-xs text-gray-400">{new Date().toDateString()}</span>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-32 rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-white focus:outline-none focus:border-fire-orange resize-none custom-scrollbar"
                        placeholder="Capture today's reflections, wins, and lessons..."
                    />

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded-lg bg-fire-orange hover:bg-orange-500 text-white text-sm flex items-center gap-2 transition-colors"
                        >
                            <FontAwesomeIcon icon={faPen} /> Save Entry
                        </button>
                        <button
                            onClick={() => setText('')}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center gap-2 transition-colors"
                        >
                            <FontAwesomeIcon icon={faBroom} /> Clear
                        </button>
                    </div>
                </div>

                {/* Entries List */}
                <div className="lg:col-span-1">
                    <h4 className="header-font text-xl mb-3 text-gray-200 flex items-center gap-2">
                        <FontAwesomeIcon icon={faClockRotateLeft} className="text-fire-orange" />
                        Recent Entries
                    </h4>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar">
                        {(!journalEntries || journalEntries.length === 0) ? (
                            <p className="text-sm text-gray-500">No entries yet. Start journaling!</p>
                        ) : (
                            journalEntries.map((entry, i) => (
                                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-xs text-gray-400 mb-1">
                                        {new Date(entry.ts).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-200 leading-relaxed">{entry.text}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
