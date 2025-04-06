import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate('/tasks');
  };

  return (
    <div className={styles.authPage}>
      <div >
        <h2>Вход</h2>
      
        <button onClick={handleLogin}>Войти</button>
      </div>
    </div>
  );
};

export default AuthPage;
