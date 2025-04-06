import React, { useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { logout } = useAuth();

  return (
    <header className={styles.header}>
      <button onClick={logout} className={styles.logoutButton}>
        Выйти
      </button>
    </header>
  );
};

export default Header;