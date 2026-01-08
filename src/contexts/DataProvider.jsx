import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { debounce } from '../utils/debounce';

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
    const [semesterGoals, setSemesterGoals] = useState([]); // New state for goals
    const [dailyLesson, setDailyLesson] = useState(null);
    const [dailyQuote, setDailyQuote] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

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

    const saveDailyLesson = async (uid, date, lesson) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/daily_content`, date), { lesson }, { merge: true });
    };

    const saveDailyQuote = async (uid, date, quote) => {
        await setDoc(doc(db, `artifacts/${getAppId()}/users/${uid}/daily_content`, date), { quote }, { merge: true });
    };

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
                if (tSnap.exists()) setDailyTasks(tSnap.data().tasks || []);

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

                // 8. Semester Goals (Load from DB or fallback to static if empty)
                const sgSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/user_data`, 'semester_goals'));
                if (sgSnap.exists()) {
                    setSemesterGoals(sgSnap.data().goals || []);
                } else {
                    // Fallback to static data for first-time load (optional)
                    // Or start empty. Let's start empty to let user add their own.
                    setSemesterGoals([]);
                }

                // 9. Daily Lesson & Quote Cache (for today only)
                const contentSnap = await getDoc(doc(db, `artifacts/${appId}/users/${uid}/daily_content`, today));
                if (contentSnap.exists()) {
                    const data = contentSnap.data();
                    if (data.lesson) setDailyLesson(data.lesson);
                    if (data.quote) setDailyQuote(data.quote);
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

    function toggleRoutineTask(tabId, index, isChecked) {
        setCheckedStates(prev => {
            // Ensure prev[tabId] is always treated as an array
            const currentTabState = prev[tabId];
            const newTabState = Array.isArray(currentTabState)
                ? [...currentTabState]
                : Object.values(currentTabState || {});

            // Ensure the array is long enough
            while (newTabState.length <= index) {
                newTabState.push(false);
            }

            newTabState[index] = isChecked;
            const newState = { ...prev, [tabId]: newTabState };

            if (currentUser) {
                const today = new Date().toISOString().split('T')[0];
                saveProgress(currentUser.uid, today, newState);
            }
            addXP(isChecked ? 5 : -5);
            return newState;
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
            if (currentUser) saveTasks(currentUser.uid, newState);
            addXP(isChecked ? 5 : -5);
            return newState;
        });
    }

    function clearCompletedDailyTasks() {
        setDailyTasks(prev => {
            const newState = prev.filter(t => !t.done);
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
        matrixTasks,
        historyData,
        semesterGoals, // Export new state
        loadingData,
        addXP,
        toggleRoutineTask,
        addDailyTask,
        toggleDailyTask,
        clearCompletedDailyTasks,
        addJournalEntry,
        addMatrixTask,
        toggleMatrixTask,
        deleteMatrixTask,
        deleteMatrixTask,
        updateGoal,
        addSemesterGoal,    // Export new functions
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
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}
