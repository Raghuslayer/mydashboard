import React, { useState } from 'react';
import { useData } from '../contexts/DataProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlay, faList, faPen, faTrash, faPlus, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import TaskFormModal from './TaskFormModal';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { motion } from 'framer-motion';

// ── Sortable wrapper ───────────────────────────────────────────────────────────
function SortableTile({ item, index, children, isDraggable }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id, disabled: !isDraggable });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Translate.toString(transform),
                transition,
                zIndex: isDragging ? 1000 : 'auto',
                position: 'relative'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: 1 }}
                transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1], // Power4.easeOut
                }}
            >
                {children({ dragHandleProps: isDraggable ? { ...attributes, ...listeners } : null })}
            </motion.div>
        </div>
    );
}

// ── Main TileGrid ──────────────────────────────────────────────────────────────
export default function TileGrid({
    items, tabId, isRoutine, checkedStates, onTileClick,
    isEditable, onAddTask, onEditTask, onDeleteTask, onReorderTask
}) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleClick = (index, item) => {
        if (isRoutine) onTileClick(index, item);
        if (item.videoUrl || item.contextItems) { setSelectedItem(item); setShowModal(true); }
    };
    const handleEditClick   = (e, item) => { e.stopPropagation(); setEditingTask(item); setShowTaskForm(true); };
    const handleDeleteClick = (e, item) => { e.stopPropagation(); setTaskToDelete(item); setShowDeleteConfirm(true); };
    const handleConfirmDelete = () => {
        if (taskToDelete && onDeleteTask) onDeleteTask(taskToDelete.id);
        setShowDeleteConfirm(false); setTaskToDelete(null);
    };
    const handleSaveTask = (taskData) => {
        if (editingTask) { if (onEditTask) onEditTask(editingTask.id, taskData); }
        else             { if (onAddTask)  onAddTask(taskData); }
        setEditingTask(null);
    };
    const handleAddNewClick = () => { setEditingTask(null); setShowTaskForm(true); };
    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oi = items.findIndex(i => i.id === active.id);
        const ni = items.findIndex(i => i.id === over.id);
        if (oi !== -1 && ni !== -1 && onReorderTask) onReorderTask(oi, ni);
    };
    const getChecked = (item, index) => {
        if (item.id && typeof checkedStates === 'object' && !Array.isArray(checkedStates))
            return checkedStates[item.id] || false;
        return checkedStates[index] || false;
    };

    const isDraggable = isEditable && items.length > 1;
    const itemIds = items.map(i => i.id);

    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={itemIds} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in">

                        {items.map((item, index) => {
                            const isChecked = getChecked(item, index);
                            const hasVideo  = !!item.videoUrl;
                            const hasCtx    = !!item.contextItems;

                            return (
                                <SortableTile key={item.id || index} item={item} index={index} isDraggable={isDraggable}>
                                    {({ dragHandleProps }) => (
                                        <div
                                            className="group"
                                            onClick={() => handleClick(item.id || index, item)}
                                            style={{
                                                position: 'relative', height: 200,
                                                borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                                                background: '#080808',
                                                border: isChecked
                                                    ? '1px solid rgba(34,197,94,0.38)'
                                                    : '1px solid rgba(192,36,42,0.20)',
                                                boxShadow: isChecked
                                                    ? '0 4px 24px rgba(34,197,94,0.14)'
                                                    : '0 4px 24px rgba(0,0,0,0.70)',
                                                transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                                                animationDelay: `${index * 0.05}s`,
                                            }}
                                        >
                                            {/* ── Thumbnail ── */}
                                            {item.thumbnail ? (
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    style={{
                                                        position: 'absolute', inset: 0,
                                                        width: '100%', height: '100%', objectFit: 'cover',
                                                        filter: isChecked ? 'grayscale(55%) brightness(0.42)' : 'brightness(0.52)',
                                                        transition: 'filter 0.35s ease, transform 0.65s ease',
                                                        transform: 'scale(1.0)',
                                                    }}
                                                    className="group-hover:!scale-[1.07] group-hover:![filter:brightness(0.68)]"
                                                />
                                            ) : (
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    background: 'linear-gradient(155deg,#100505 0%,#1c0808 50%,#080808 100%)',
                                                }} />
                                            )}

                                            {/* ── Cinematic scrim ── */}
                                            <div style={{
                                                position: 'absolute', inset: 0, pointerEvents: 'none',
                                                background: isChecked
                                                    ? 'linear-gradient(to top,rgba(3,18,6,0.98) 0%,rgba(0,14,4,0.72) 52%,transparent 100%)'
                                                    : 'linear-gradient(to top,rgba(4,0,0,0.98) 0%,rgba(10,0,0,0.68) 55%,transparent 100%)',
                                            }} />

                                            {/* ── Left accent stripe ── */}
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, pointerEvents: 'none',
                                                background: isChecked
                                                    ? 'linear-gradient(to bottom,rgba(34,197,94,0.92),rgba(20,100,40,0.18))'
                                                    : 'linear-gradient(to bottom,rgba(192,36,42,0.92),rgba(80,10,10,0.12))',
                                                boxShadow: isChecked
                                                    ? '2px 0 14px rgba(34,197,94,0.35)'
                                                    : '2px 0 14px rgba(192,36,42,0.45)',
                                            }} />

                                            {/* ── Top-right type badges ── */}
                                            <div style={{ position:'absolute', top:10, right:10, display:'flex', gap:5, zIndex:20 }}>
                                                {hasVideo && (
                                                    <div style={{
                                                        background:'rgba(180,22,22,0.82)', backdropFilter:'blur(10px)',
                                                        border:'1px solid rgba(255,80,80,0.32)', borderRadius:6,
                                                        padding:'3px 8px', display:'flex', alignItems:'center', gap:4,
                                                        fontSize:9, fontWeight:700, color:'#ffd0d0', letterSpacing:'0.08em',
                                                    }}>
                                                        <FontAwesomeIcon icon={faPlay} style={{fontSize:8}} /> VIDEO
                                                    </div>
                                                )}
                                                {hasCtx && (
                                                    <div style={{
                                                        background:'rgba(20,50,130,0.82)', backdropFilter:'blur(10px)',
                                                        border:'1px solid rgba(80,120,255,0.32)', borderRadius:6,
                                                        padding:'3px 8px', display:'flex', alignItems:'center', gap:4,
                                                        fontSize:9, fontWeight:700, color:'#8ab4ff', letterSpacing:'0.08em',
                                                    }}>
                                                        <FontAwesomeIcon icon={faList} style={{fontSize:8}} /> LIST
                                                    </div>
                                                )}
                                            </div>

                                            {/* ── Edit/drag controls (hover) ── */}
                                            {isEditable && (
                                                <div
                                                    style={{ position:'absolute', top:10, left:12, zIndex:20, display:'flex', gap:5, transition:'opacity 0.18s' }}
                                                    className="opacity-100 md:opacity-0 md:group-hover:!opacity-100"
                                                >
                                                    {dragHandleProps && (
                                                        <div
                                                            {...dragHandleProps}
                                                            title="Drag to reorder"
                                                            onClick={e => e.stopPropagation()}
                                                            style={{
                                                                background:'rgba(50,50,50,0.88)', backdropFilter:'blur(10px)',
                                                                border:'1px solid rgba(255,255,255,0.11)', borderRadius:6,
                                                                width:28, height:28, display:'flex', alignItems:'center',
                                                                justifyContent:'center', cursor:'grab', color:'#aaa', fontSize:11,
                                                            }}
                                                        ><FontAwesomeIcon icon={faGripVertical} /></div>
                                                    )}
                                                    <button onClick={e => handleEditClick(e, item)} title="Edit" style={{
                                                        background:'rgba(20,50,180,0.88)', backdropFilter:'blur(10px)',
                                                        border:'1px solid rgba(80,120,255,0.38)', borderRadius:6,
                                                        width:28, height:28, display:'flex', alignItems:'center',
                                                        justifyContent:'center', color:'#8ab4ff', fontSize:11, cursor:'pointer',
                                                    }}><FontAwesomeIcon icon={faPen} /></button>
                                                    <button onClick={e => handleDeleteClick(e, item)} title="Delete" style={{
                                                        background:'rgba(180,18,18,0.88)', backdropFilter:'blur(10px)',
                                                        border:'1px solid rgba(255,80,80,0.38)', borderRadius:6,
                                                        width:28, height:28, display:'flex', alignItems:'center',
                                                        justifyContent:'center', color:'#ff9090', fontSize:11, cursor:'pointer',
                                                    }}><FontAwesomeIcon icon={faTrash} /></button>
                                                </div>
                                            )}

                                            {/* ── DONE pill ── */}
                                            {isChecked && (
                                                <div style={{
                                                    position:'absolute', top:10, left:'50%', transform:'translateX(-50%)',
                                                    background:'rgba(20,80,30,0.80)', backdropFilter:'blur(10px)',
                                                    border:'1px solid rgba(34,197,94,0.42)', borderRadius:20,
                                                    padding:'4px 12px', display:'flex', alignItems:'center', gap:6, zIndex:20,
                                                }}>
                                                    <FontAwesomeIcon icon={faCheck} style={{color:'#22c55e',fontSize:10}} />
                                                    <span style={{color:'#22c55e',fontSize:10,fontWeight:700,letterSpacing:'0.12em'}}>DONE</span>
                                                </div>
                                            )}

                                            {/* ── Bottom content ── */}
                                            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'12px 14px 14px 16px', zIndex:10 }}>
                                                {/* Rank tag */}
                                                <div style={{
                                                    display:'inline-flex', alignItems:'center', gap:4, marginBottom:5,
                                                    background: isChecked ? 'rgba(20,80,30,0.55)' : 'rgba(192,36,42,0.18)',
                                                    border: `1px solid ${isChecked ? 'rgba(34,197,94,0.30)' : 'rgba(192,36,42,0.28)'}`,
                                                    borderRadius:4, padding:'1px 7px',
                                                    fontSize:9, fontWeight:700, letterSpacing:'0.12em',
                                                    color: isChecked ? '#4ade80' : 'rgba(200,110,100,0.90)',
                                                }}>
                                                    {isChecked ? '✓ COMPLETE' : `TASK ${String(index + 1).padStart(2, '0')}`}
                                                </div>

                                                <h3 style={{
                                                    fontFamily:"'Teko',sans-serif",
                                                    fontSize:'1.32rem', fontWeight:700, lineHeight:1.1, marginBottom:4,
                                                    color: isChecked ? '#4ade80' : '#f2eaea',
                                                    WebkitTextFillColor: isChecked ? '#4ade80' : '#f2eaea',
                                                    letterSpacing:'0.02em',
                                                    textDecoration: isChecked ? 'line-through' : 'none',
                                                    textDecorationColor:'rgba(34,197,94,0.45)',
                                                    transition:'color 0.3s',
                                                }}>{item.title}</h3>

                                                {item.description && (
                                                    <p style={{
                                                        fontSize:11, lineHeight:1.4,
                                                        color:'rgba(155,130,130,0.68)',
                                                        WebkitTextFillColor:'rgba(155,130,130,0.68)',
                                                        display:'-webkit-box',
                                                        WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                                                        overflow:'hidden',
                                                    }}>{item.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </SortableTile>
                            );
                        })}

                        {/* ── Add New Task tile ── */}
                        {isEditable && (
                            <motion.div
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: items.length * 0.08,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="group"
                                onClick={handleAddNewClick}
                                style={{
                                    height:200, borderRadius:14, cursor:'pointer',
                                    border:'1px dashed rgba(192,36,42,0.32)',
                                    background:'linear-gradient(155deg,rgba(14,4,4,0.92) 0%,rgba(8,2,2,0.96) 100%)',
                                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12,
                                    position:'relative', overflow:'hidden',
                                    transition:'border-color 0.25s ease, box-shadow 0.25s ease',
                                }}
                            >
                                {/* forge grid */}
                                <div style={{
                                    position:'absolute', inset:0, pointerEvents:'none',
                                    backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(192,36,42,0.04) 19px,rgba(192,36,42,0.04) 20px),repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(192,36,42,0.04) 19px,rgba(192,36,42,0.04) 20px)',
                                }} />
                                {/* hover center glow */}
                                <div style={{
                                    position:'absolute', inset:0, pointerEvents:'none',
                                    background:'radial-gradient(ellipse at 50% 50%,rgba(192,36,42,0.10) 0%,transparent 70%)',
                                    opacity:0, transition:'opacity 0.28s',
                                }} className="group-hover:!opacity-100" />

                                <div style={{
                                    width:50, height:50, borderRadius:'50%',
                                    background:'linear-gradient(135deg,rgba(192,36,42,0.22),rgba(100,10,10,0.12))',
                                    border:'1px solid rgba(192,36,42,0.38)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    boxShadow:'0 0 18px rgba(192,36,42,0.12)',
                                    transition:'all 0.25s ease',
                                }} className="group-hover:!shadow-[0_0_28px_rgba(192,36,42,0.40)]">
                                    <FontAwesomeIcon icon={faPlus} style={{color:'#c0242a', fontSize:21}} />
                                </div>

                                <div style={{textAlign:'center'}}>
                                    <div style={{
                                        fontFamily:"'Teko',sans-serif", fontSize:'1.1rem', fontWeight:700,
                                        color:'rgba(192,36,42,0.72)', WebkitTextFillColor:'rgba(192,36,42,0.72)',
                                        letterSpacing:'0.10em', textTransform:'uppercase', lineHeight:1,
                                        transition:'color 0.22s',
                                    }} className="group-hover:![color:rgba(224,70,70,0.95)] group-hover:![WebkitTextFillColor:rgba(224,70,70,0.95)]">
                                        Add New Task
                                    </div>
                                    <div style={{fontSize:10,color:'rgba(110,70,70,0.50)',marginTop:3,letterSpacing:'0.06em'}}>
                                        click to create
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>

            {/* ── Video / Context Modal ── */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedItem?.title}>
                {selectedItem?.videoUrl && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-black">
                        <video src={selectedItem.videoUrl} controls autoPlay className="w-full h-full" />
                    </div>
                )}
                {selectedItem?.description && (
                    <p className="text-lg text-gray-300 mb-6 font-light">{selectedItem.description}</p>
                )}
                {selectedItem?.contextItems && (
                    <div style={{background:'rgba(192,36,42,0.08)',border:'1px solid rgba(192,36,42,0.20)',borderRadius:10,padding:16}}>
                        <h4 style={{fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'rgba(192,80,70,0.70)',marginBottom:10}}>
                            Checklist / Details
                        </h4>
                        <ul style={{display:'flex',flexDirection:'column',gap:8}}>
                            {selectedItem.contextItems.map((ci, i) => (
                                <li key={i} style={{display:'flex',alignItems:'center',gap:8,color:'#c0b0b0',fontSize:13}}>
                                    <span style={{width:6,height:6,borderRadius:'50%',background:'#c0242a',flexShrink:0}} />
                                    {ci}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>

            {/* ── Task Form Modal ── */}
            <TaskFormModal
                isOpen={showTaskForm}
                onClose={() => { setShowTaskForm(false); setEditingTask(null); }}
                onSave={handleSaveTask}
                initialData={editingTask}
                mode={editingTask ? 'edit' : 'add'}
                tabType={tabId}
            />

            {/* ── Delete Confirm Modal ── */}
            <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setTaskToDelete(null); }} title="Confirm Delete">
                <div style={{textAlign:'center',padding:'16px 0'}}>
                    <div style={{
                        width:64,height:64,borderRadius:'50%',
                        background:'rgba(192,36,42,0.14)',border:'1px solid rgba(192,36,42,0.35)',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        margin:'0 auto 20px',boxShadow:'0 0 24px rgba(192,36,42,0.18)',
                    }}>
                        <FontAwesomeIcon icon={faTrash} style={{color:'#c0242a',fontSize:24}} />
                    </div>
                    <h3 style={{fontFamily:"'Teko',sans-serif",fontSize:'1.6rem',color:'#e0c0c0',WebkitTextFillColor:'#e0c0c0',letterSpacing:'0.04em',marginBottom:6}}>
                        Delete this task?
                    </h3>
                    <p style={{color:'rgba(160,120,120,0.68)',fontSize:13,marginBottom:24,lineHeight:1.5}}>
                        "<strong style={{color:'rgba(220,180,180,0.85)'}}>{taskToDelete?.title}</strong>" will be permanently removed.
                    </p>
                    <div style={{display:'flex',gap:10}}>
                        <button
                            onClick={() => { setShowDeleteConfirm(false); setTaskToDelete(null); }}
                            style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:10,padding:'12px 0',color:'#888',cursor:'pointer',fontSize:14}}
                        >Cancel</button>
                        <button
                            onClick={handleConfirmDelete}
                            style={{flex:1,background:'linear-gradient(135deg,#8b1a1a,#c0242a)',border:'1px solid rgba(192,36,42,0.50)',borderRadius:10,padding:'12px 0',color:'#fff',WebkitTextFillColor:'#fff',cursor:'pointer',fontSize:14,fontWeight:700,boxShadow:'0 4px 18px rgba(192,36,42,0.32)'}}
                        >Delete</button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
