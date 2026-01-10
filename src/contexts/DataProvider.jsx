import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { debounce } from '../utils/debounce';
import { staticData, routineTabs } from '../data/staticData';

const DataContext = createContext();

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const { currentUser } = useAuth();

    // Global State
    const [userData, setUserData] = useState({ xp: 0, level: 1, goal: 'UNLEASH YOUR INNER FIRE' });
    const [checkedStates, setCheckedStates] = useState({});
    const [dailyTasks, setDailyTasks] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [matrixTasks, setMatrixTasks] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [semesterGoals, setSemesterGoals] = useState([]);
    const [customRoutineTasks, setCustomRoutineTasks] = useState({}); // { morning: [...], deepWork: [...], night: [...] }
    const [dailyLesson, setDailyLesson] = useState(null);
    const [dailyQuote, setDailyQuote] = useState(null);
    const [dailyAnalysis, setDailyAnalysis] = useState(null); // Cached AI analysis
    const [dailyTaskHistory, setDailyTaskHistory] = useState([]); // Separate history for user daily tasks
    const [loadingData, setLoadingData] = useState(true);

    // Editable routine tabs - these can be customized by the user
    const editableRoutineTabs = ['morning', 'deepWork', 'night', 'vault', 'learning', 'commitments', 'neverDo', 'mustDo', 'skills'];

    // IMPORTANT: Use 'default-app-id' to match the original HTML dashboard's Firebase path
    // The data was stored under artifacts/default-app-id/users/... not the actual Firebase app ID
    const getAppId = () => 'default-app-id';

    // ===== SAVE FUNCTIONS (Debounced) =====

    const saveGamification = useCallback(debounce(async (uid, data) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/user_data`, 'gamification'), data, { merge: true });
    }, 2000), []);

    const saveProgress = useCallback(debounce(async (uid, date, states) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/daily_progress`, date), { checkedStates: states }, { merge: true });
    }, 1000), []);

    const saveTasks = useCallback(debounce(async (uid, tasks) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/user_data`, 'daily_tasks'), { tasks }, { merge: true });
    }, 1000), []);

    const saveJournal = useCallback(debounce(async (uid, entries) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/user_data`, 'journal'), { entries }, { merge: true });
    }, 1000), []);

    const saveMatrix = useCallback(debounce(async (uid, tasks) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/user_data`, 'matrix_tasks'), { tasks }, { merge: true });
    }, 1000), []);

    const saveGoal = useCallback(debounce(async (uid, goal) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/user_data`, 'main_goal'), { goal }, { merge: true });
    }, 1000), []);

    const saveSemesterGoals = useCallback(debounce(async (uid, goals) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/user_data`, 'semester_goals'), { goals }, { merge: true });
    }, 1000), []);

    const saveRoutineTasks = useCallback(debounce(async (uid, tasks) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/user_data`, 'routine_tasks'), { tasks }, { merge: true });
    }, 1000), []);

    // Save daily task stats for analytics (separate from routine task history)
    const saveDailyTaskStats = useCallback(debounce(async (uid, date, stats) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/daily_task_history`, date), stats, { merge: true });
    }, 2000), []);

    // Save daily history summary (total and completed tasks) for History and Analysis pages
    const saveDailyHistory = useCallback(debounce(async (uid, date, stats) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/daily_history`, date), stats, { merge: true });
    }, 2000), []);

    const saveDailyLesson = async (uid, date, lesson) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/daily_content`, date), { lesson }, { merge: true });
    };

    const saveDailyQuote = async (uid, date, quote) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/daily_content`, date), { quote }, { merge: true });
    };

    const saveDailyAnalysis = async (uid, date, analysis) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/daily_content`, date), { analysis }, { merge: true });
    };

    // ===== HELPER FUNCTION: Calculate Daily Stats =====

    // Calculate total and completed tasks from all sources (routine tasks + daily tasks)
    function calculateDailyStats(currentCheckedStates, currentDailyTasks, currentCustomRoutineTasks) {
        let completed = 0;
        let total = 0;

        // Count routine tasks from all tabs
        routineTabs.forEach(tabId => {
            const isEditable = editableRoutineTabs.includes(tabId);
            const items = isEditable ? (currentCustomRoutineTasks[tabId] || []) : (staticData[tabId] || []);
            total += items.length;

            const tabState = currentCheckedStates[tabId] || {};
            if (isEditable && typeof tabState === 'object' && !Array.isArray(tabState)) {
                // ID-based counting for editable tabs
                completed += Object.values(tabState).filter(Boolean).length;
            } else {
                // Index-based counting for legacy tabs
                const states = Array.isArray(tabState) ? tabState : Object.values(tabState);
                completed += states.filter(Boolean).length;
            }
        });

        // Count daily tasks
        total += currentDailyTasks.length;
        completed += currentDailyTasks.filter(t => t.done).length;

        return { total, completed };
    }

    // ===== CLEANUP: Old Completed Daily Tasks =====

    // Clean up old completed daily tasks to optimize Firebase storage
    // Keeps: uncompleted tasks (carry over), today's tasks
    // Archives: old completed tasks as stats only
    async function cleanupOldDailyTasks(currentTasks, currentUser) {
        if (!currentUser || !currentTasks || currentTasks.length === 0) return currentTasks;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        // Separate tasks by category
        const oldCompletedTasks = [];
        const oldUncompletedTasks = [];
        const todaysTasks = [];

        currentTasks.forEach(task => {
            const taskDate = new Date(task.createdAt);
            taskDate.setHours(0, 0, 0, 0);
            const taskTimestamp = taskDate.getTime();

            if (taskTimestamp < todayTimestamp) {
                // Task from previous day
                if (task.done) {
                    oldCompletedTasks.push(task);
                } else {
                    oldUncompletedTasks.push(task); // Keep uncompleted
                }
            } else {
                // Task from today
                todaysTasks.push(task);
            }
        });

        // Archive old completed tasks (stats only, delete task objects)
        if (oldCompletedTasks.length > 0) {
            // Group by date
            const tasksByDate = {};
            oldCompletedTasks.forEach(task => {
                const dateKey = new Date(task.createdAt).toISOString().split('T')[0];
                if (!tasksByDate[dateKey]) {
                    tasksByDate[dateKey] = { completed: 0, total: 0 };
                }
                tasksByDate[dateKey].completed += task.done ? 1 : 0;
                tasksByDate[dateKey].total += 1;
            });

            // Save stats for each date
            const appId = getAppId();
            for (const [date, stats] of Object.entries(tasksByDate)) {
                const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                await setDoc(
                    doc(db, `artifacts/${appId}/users/${currentUser.uid}/daily_task_history`, date),
                    { total: stats.total, completed: stats.completed, percent },
                    { merge: true }
                );
            }
        }

        // Return only uncompleted old tasks + today's tasks
        const cleanedTasks = [...oldUncompletedTasks, ...todaysTasks];
        return cleanedTasks;
    }

    // ===== LOAD DATA =====

    useEffect(() => {
        if (!currentUser) {
            setLoadingData(false);
            return;
        }

        async function load() {
            try {
                const appId = getAppId();
                const uid = currentUser.uid;
                const today = new Date().toISOString().split('T')[0];

                // 1. Gamification
                const gSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'gamification'));
                const gData = gSnap.exists() ? gSnap.data() : { xp: 0, level: 1 };

                // 2. Goal
                const goalSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'main_goal'));
                const goal = goalSnap.exists() ? goalSnap.data().goal : 'UNLEASH YOUR INNER FIRE';

                setUserData({ ...gData, goal });

                // 3. Daily Progress
                const pSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/daily_progress`, today));
                if (pSnap.exists()) setCheckedStates(pSnap.data().checkedStates || {});
                else setCheckedStates({});

                // 4. Daily Tasks
                const tSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'daily_tasks'));
                let loadedTasks = tSnap.exists() ? tSnap.data().tasks || [] : [];

                // Clean up old completed tasks (archive stats, keep only uncompleted + today's)
                const originalLength = loadedTasks.length;
                loadedTasks = await cleanupOldDailyTasks(loadedTasks, currentUser);
                setDailyTasks(loadedTasks);

                // Save cleaned tasks back to Firebase if cleanup removed items
                if (originalLength !== loadedTasks.length) {
                    await setDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'daily_tasks'), { tasks: loadedTasks });
                }

                // 5. Journal
                const jSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'journal'));
                if (jSnap.exists()) setJournalEntries(jSnap.data().entries || []);

                // 6. Matrix Tasks
                const mSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'matrix_tasks'));
                if (mSnap.exists()) setMatrixTasks(mSnap.data().tasks || []);

                // 7. History Data
                const historyRef = collection(db, `artifacts/${appId}/users/${uid}/daily_history`);
                const historySnap = await getDocs(historyRef);
                const history = [];
                historySnap.forEach(doc => {
                    history.push({ date: doc.id, ...doc.data() });
                });
                history.sort((a, b) => new Date(a.date) - new Date(b.date));
                setHistoryData(history);

                // 7b. Daily Task History (separate from routine tasks)
                const taskHistoryRef = collection(db, `artifacts/${appId}/users/${uid}/daily_task_history`);
                const taskHistorySnap = await getDocs(taskHistoryRef);
                const taskHistory = [];
                taskHistorySnap.forEach(doc => {
                    taskHistory.push({ date: doc.id, ...doc.data() });
                });
                taskHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
                setDailyTaskHistory(taskHistory);

                // 8. Semester Goals (Load from DB or fallback to static if empty)
                const sgSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'semester_goals'));
                if (sgSnap.exists()) {
                    setSemesterGoals(sgSnap.data().goals || []);
                } else {
                    setSemesterGoals([]);
                }

                // 9. Custom Routine Tasks (Initialize from static data if not exists, merge with existing)
                const rtSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'routine_tasks'));
                const existingTasks = rtSnap.exists() && rtSnap.data().tasks ? rtSnap.data().tasks : {};

                // Merge: keep existing data, add static data for tabs that don't exist yet
                const mergedTasks = { ...existingTasks };
                let needsUpdate = false;

                editableRoutineTabs.forEach(tabId => {
                    // If this tab doesn't exist in Firebase, initialize from static data
                    if (!mergedTasks[tabId] || mergedTasks[tabId].length === 0) {
                        const staticItems = staticData[tabId] || [];
                        if (staticItems.length > 0) {
                            mergedTasks[tabId] = staticItems.map((task, idx) => ({
                                id: `${tabId}-${idx}-${Date.now()}`,
                                ...task
                            }));
                            needsUpdate = true;
                        }
                    }
                });

                setCustomRoutineTasks(mergedTasks);

                // Save merged data to Firebase if we added new tabs
                if (needsUpdate) {
                    await setDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'routine_tasks'), { tasks: mergedTasks });
                }

                // 10. Daily Lesson & Quote Cache (for today only)
                const contentSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/daily_content`, today));
                if (contentSnap.exists()) {
                    const data = contentSnap.data();
                    if (data.lesson) setDailyLesson(data.lesson);
                    if (data.quote) setDailyQuote(data.quote);
                    if (data.analysis) setDailyAnalysis(data.analysis);
                }

            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoadingData(false);
            }
        }

        load();
    }, [currentUser]);

    // ===== ACTIONS =====

    function addXP(amount) {
        setUserData(prev => {
            const nextXP = Math.max(0, prev.xp + amount);
            const nextLevel = Math.floor(nextXP / 100) + 1;
            const newData = { ...prev, xp: nextXP, level: nextLevel };
            if (currentUser) saveGamification(currentUser.uid, { xp: nextXP, level: nextLevel });
            return newData;
        });
    }

    // Toggle routine task - now uses task ID for editable tabs, falls back to index for others
    function toggleRoutineTask(tabId, taskIdOrIndex, isChecked) {
        setCheckedStates(prev => {
            const currentTabState = prev[tabId] || {};
            let newTabState;

            // For editable tabs, use ID-based tracking
            if (editableRoutineTabs.includes(tabId) && typeof taskIdOrIndex === 'string') {
                newTabState = { ...currentTabState, [taskIdOrIndex]: isChecked };
            } else {
                // Legacy index-based for non-editable tabs
                const arrState = Array.isArray(currentTabState)
                    ? [...currentTabState]
                    : Object.values(currentTabState || {});
                while (arrState.length <= taskIdOrIndex) {
                    arrState.push(false);
                }
                arrState[taskIdOrIndex] = isChecked;
                newTabState = arrState;
            }

            const newState = { ...prev, [tabId]: newTabState };

            if (currentUser) {
                const today = new Date().toISOString().split('T')[0];
                saveProgress(currentUser.uid, today, newState);

                // Calculate and save daily history summary
                const stats = calculateDailyStats(newState, dailyTasks, customRoutineTasks);
                saveDailyHistory(currentUser.uid, today, stats);
            }
            addXP(isChecked ? 5 : -5);
            return newState;
        });
    }

    // Get routine tasks - returns custom tasks for editable tabs, static data for others
    function getRoutineTasks(tabId) {
        if (editableRoutineTabs.includes(tabId)) {
            return customRoutineTasks[tabId] || [];
        }
        return staticData[tabId] || [];
    }

    // Add a new routine task
    function addRoutineTask(tabId, taskData) {
        if (!editableRoutineTabs.includes(tabId)) return;

        const newTask = {
            id: crypto.randomUUID(),
            title: taskData.title || 'New Task',
            description: taskData.description || '',
            thumbnail: taskData.thumbnail || `https://placehold.co/600x400/2A0000/FF5E00?text=${encodeURIComponent(taskData.title || 'NEW')}`,
            createdAt: Date.now()
        };

        setCustomRoutineTasks(prev => {
            const newState = {
                ...prev,
                [tabId]: [...(prev[tabId] || []), newTask]
            };
            if (currentUser) saveRoutineTasks(currentUser.uid, newState);
            return newState;
        });
    }

    // Update an existing routine task
    function updateRoutineTask(tabId, taskId, updatedData) {
        if (!editableRoutineTabs.includes(tabId)) return;

        setCustomRoutineTasks(prev => {
            const newState = {
                ...prev,
                [tabId]: (prev[tabId] || []).map(task =>
                    task.id === taskId ? { ...task, ...updatedData } : task
                )
            };
            if (currentUser) saveRoutineTasks(currentUser.uid, newState);
            return newState;
        });
    }

    // Delete a routine task
    function deleteRoutineTask(tabId, taskId) {
        if (!editableRoutineTabs.includes(tabId)) return;

        setCustomRoutineTasks(prev => {
            const newState = {
                ...prev,
                [tabId]: (prev[tabId] || []).filter(task => task.id !== taskId)
            };
            if (currentUser) saveRoutineTasks(currentUser.uid, newState);
            return newState;
        });

        // Also remove from checkedStates
        setCheckedStates(prev => {
            const tabState = prev[tabId];
            if (tabState && typeof tabState === 'object' && !Array.isArray(tabState)) {
                const { [taskId]: _, ...rest } = tabState;
                const newState = { ...prev, [tabId]: rest };
                if (currentUser) {
                    const today = new Date().toISOString().split('T')[0];
                    saveProgress(currentUser.uid, today, newState);
                }
                return newState;
            }
            return prev;
        });
    }

    // Daily Tasks
    function addDailyTask(text) {
        const newTask = { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() };
        setDailyTasks(prev => {
            const newState = [newTask, ...prev];
            if (currentUser) saveTasks(currentUser.uid, newState);
            return newState;
        });
    }

    function toggleDailyTask(id, isChecked) {
        setDailyTasks(prev => {
            const newState = prev.map(t => t.id === id ? { ...t, done: isChecked } : t);
            if (currentUser) {
                saveTasks(currentUser.uid, newState);
                // Update daily task stats
                updateDailyTaskStats(newState);

                // Calculate and save daily history summary
                const today = new Date().toISOString().split('T')[0];
                const stats = calculateDailyStats(checkedStates, newState, customRoutineTasks);
                saveDailyHistory(currentUser.uid, today, stats);
            }
            addXP(isChecked ? 5 : -5);
            return newState;
        });
    }

    // Update daily task history stats
    function updateDailyTaskStats(tasks) {
        if (!currentUser) return;
        const today = new Date().toISOString().split('T')[0];
        const total = tasks.length;
        const completed = tasks.filter(t => t.done).length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update local state
        setDailyTaskHistory(prev => {
            const existing = prev.find(d => d.date === today);
            if (existing) {
                return prev.map(d => d.date === today ? { ...d, total, completed, percent } : d);
            } else {
                return [...prev, { date: today, total, completed, percent }];
            }
        });

        // Save to Firebase (debounced)
        saveDailyTaskStats(currentUser.uid, today, { total, completed, percent });
    }

    function clearCompletedDailyTasks() {
        setDailyTasks(prev => {
            const newState = prev.filter(t => !t.done);
            if (currentUser) saveTasks(currentUser.uid, newState);
            return newState;
        });
    }

    function deleteDailyTask(id) {
        setDailyTasks(prev => {
            const newState = prev.filter(t => t.id !== id);
            if (currentUser) saveTasks(currentUser.uid, newState);
            return newState;
        });
    }

    // Journal
    function addJournalEntry(text) {
        const newEntry = { text, ts: Date.now() };
        setJournalEntries(prev => {
            const newState = [newEntry, ...prev].slice(0, 50);
            if (currentUser) saveJournal(currentUser.uid, newState);
            return newState;
        });
        addXP(10);
    }

    // Matrix Tasks
    function addMatrixTask(quadrant, text) {
        const newTask = { id: crypto.randomUUID(), quadrant, text, done: false, createdAt: Date.now() };
        setMatrixTasks(prev => {
            const newState = [...prev, newTask];
            if (currentUser) saveMatrix(currentUser.uid, newState);
            return newState;
        });
    }

    function toggleMatrixTask(id, isChecked) {
        setMatrixTasks(prev => {
            const newState = prev.map(t => t.id === id ? { ...t, done: isChecked } : t);
            if (currentUser) saveMatrix(currentUser.uid, newState);
            addXP(isChecked ? 5 : -5);
            return newState;
        });
    }

    function deleteMatrixTask(id) {
        setMatrixTasks(prev => {
            const newState = prev.filter(t => t.id !== id);
            if (currentUser) saveMatrix(currentUser.uid, newState);
            return newState;
        });
    }

    // Goal
    function updateGoal(newGoal) {
        setUserData(prev => ({ ...prev, goal: newGoal }));
        if (currentUser) saveGoal(currentUser.uid, newGoal);
    }

    // Semester Goals CRUD
    function addSemesterGoal(goalData) { // { title, description, ... }
        const newGoal = { id: crypto.randomUUID(), ...goalData, createdAt: Date.now() };
        setSemesterGoals(prev => {
            const newState = [...prev, newGoal];
            if (currentUser) saveSemesterGoals(currentUser.uid, newState);
            return newState;
        });
    }

    function updateSemesterGoal(id, updatedData) {
        setSemesterGoals(prev => {
            const newState = prev.map(g => g.id === id ? { ...g, ...updatedData } : g);
            if (currentUser) saveSemesterGoals(currentUser.uid, newState);
            return newState;
        });
    }

    function deleteSemesterGoal(id) {
        setSemesterGoals(prev => {
            const newState = prev.filter(g => g.id !== id);
            if (currentUser) saveSemesterGoals(currentUser.uid, newState);
            return newState;
        });
    }

    const value = {
        userData,
        checkedStates,
        dailyTasks,
        journalEntries,
        matrixTasks,
        historyData,
        dailyTaskHistory, // Separate history for user-created daily tasks
        semesterGoals,
        customRoutineTasks, // Custom routine tasks state
        loadingData,
        addXP,
        toggleRoutineTask,
        getRoutineTasks,       // Get tasks for a tab
        addRoutineTask,        // Add new routine task
        updateRoutineTask,     // Update routine task
        deleteRoutineTask,     // Delete routine task
        editableRoutineTabs,   // Which tabs are editable
        addDailyTask,
        toggleDailyTask,
        clearCompletedDailyTasks,
        deleteDailyTask,
        addJournalEntry,
        addMatrixTask,
        toggleMatrixTask,
        deleteMatrixTask,
        updateGoal,
        addSemesterGoal,
        updateSemesterGoal,
        deleteSemesterGoal,
        dailyLesson,
        dailyQuote,
        setDailyLesson: (lesson) => {
            setDailyLesson(lesson);
            if (currentUser) {
                const today = new Date().toISOString().split('T')[0];
                saveDailyLesson(currentUser.uid, today, lesson);
            }
        },
        setDailyQuote: (quote) => {
            setDailyQuote(quote);
            if (currentUser) {
                const today = new Date().toISOString().split('T')[0];
                saveDailyQuote(currentUser.uid, today, quote);
            }
        },
        dailyAnalysis,
        setDailyAnalysis: (analysis) => {
            setDailyAnalysis(analysis);
            if (currentUser) {
                const today = new Date().toISOString().split('T')[0];
                saveDailyAnalysis(currentUser.uid, today, analysis);
            }
        },
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
