import React from 'react';
import AppRouter from './routes/AppRouter';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
