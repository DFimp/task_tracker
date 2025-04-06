import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.center}>
        <button onClick={() => navigate('/report')} className={styles.reportButton}>
          Отчёт
        </button>
      </div>
      <div className={styles.right}>
        <button onClick={logout} className={styles.logoutButton}>
          Выйти
        </button>
      </div>
    </header>
  );
};

export default Header;
