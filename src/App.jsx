import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardContent from './pages/DashboardContent';
import Matrix from './pages/Matrix';
import Journal from './pages/Journal';
import Analysis from './pages/Analysis';
import SkillMap from './pages/SkillMap';
import Goal from './pages/Goal';
import Tasks from './pages/Tasks';
import DynamicLesson from './pages/DynamicLesson';
import DynamicQuote from './pages/DynamicQuote';
import History from './pages/History';
import SemesterGoals from './pages/SemesterGoals';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="morning" replace />} />
        <Route path="matrix" element={<Matrix />} />
        <Route path="journal" element={<Journal />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="skillMap" element={<SkillMap />} />
        <Route path="goal" element={<Goal />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="lesson" element={<DynamicLesson />} />
        <Route path="quote" element={<DynamicQuote />} />
        <Route path="history" element={<History />} />
        <Route path="semesterGoals" element={<SemesterGoals />} />
        {/* Dynamic route for all other tabs (morning, night, deepWork, etc) */}
        <Route path=":tabId" element={<DashboardContent />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
