import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage/AuthPage';
import TasksPage from '../pages/TasksPage/TasksPage';
import PomodoroPage from '../pages/PomodoroPage/PomodoroPage';
import ReportPage from '../pages/ReportPage/ReportPage';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import ResetPasswordPage from '../pages/ResetPasswordPage/ResetPasswordPage';


const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <PrivateRoute>
            <div style={{ padding: '2rem' }}>
              <h2>404 – Страница не найдена</h2>
              <p>Проверьте правильность URL или перейдите <a href="/tasks">на главную</a>.</p>
            </div>
          </PrivateRoute>
        }
      />
      
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      <Route path="/" element={<Navigate to="/auth" />} />
      
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <TasksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/pomodoro/:id"
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
