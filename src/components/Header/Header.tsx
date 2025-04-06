import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  locked?: boolean;
}

const Header: React.FC<HeaderProps> = ({ locked = false }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.center}>
        <button
          onClick={() => navigate('/tasks')}
          className={styles.navButton}
          disabled={locked}
        >
          Задачи
        </button>
        <button
          onClick={() => navigate('/report')}
          className={styles.navButton}
          disabled={locked}
        >
          Отчёт
        </button>
      </div>
      <div className={styles.right}>
        <button
          onClick={logout}
          className={styles.logoutButton}
          disabled={locked}
        >
          Выйти
        </button>
      </div>
    </header>
  );
};

export default Header;
