import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage/AuthPage';
import TasksPage from '../pages/TasksPage/TasksPage';
import PomodoroPage from '../pages/PomodoroPage';
import ReportPage from '../pages/ReportPage';
import PrivateRoute from './PrivateRoute';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TasksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/pomodoro"
        element={
          <PrivateRoute>
            <PomodoroPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/report"
        element={
          <PrivateRoute>
            <ReportPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default AppRouter;
