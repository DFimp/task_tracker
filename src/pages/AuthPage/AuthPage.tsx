import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const validatePassword = (pwd: string): boolean => {
    const hasMinLength = pwd.length >= 6;
    const uppercaseCount = (pwd.match(/[A-Z]/g) || []).length;
    const hasSpecialChar = /[^A-Za-z0-9]/.test(pwd);
    return hasMinLength && uppercaseCount >= 2 && hasSpecialChar;
  };

  const handleLogin = () => {
    if (isLogin) {
      login();
      navigate('/tasks');
    } else {
      if (!validatePassword(password)) {
        setPasswordError(
          'Пароль должен быть не менее 6 символов, содержать хотя бы две заглавные буквы и один специальный символ.'
        );
        return;
      }
      // Здесь логика регистрации (если есть)
      console.log('Регистрация...');
      login(); // временно так
      navigate('/tasks');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(prev => !prev);
    setPasswordError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleResetPassword = () => {
    // Здесь логика восстановления пароля
    console.log('Восстановление пароля...');
    // например, navigate('/reset-password');
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authPage__wrapperForm}>
        <h2 className={styles.form__title}>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        
          <form className={styles.authPage__form}>
            <span className={styles.form__text}>Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <span className={styles.form__text}>Пароль</span>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <span className={styles.eyeIcon} onClick={togglePasswordVisibility}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            {passwordError && <p className={styles.errorText}>{passwordError}</p>}


            {isLogin && (
              <span
                className={styles.linkText}
                onClick={handleResetPassword}
              >
                Восстановить пароль
              </span>
            )}

          </form>
        
        <button onClick={handleLogin}>{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
        
        <div className={styles.wrapperForm__text}>
          {isLogin ? 'Если у вас нет аккаунта, пройдите ' : 'Если у вас уже есть аккаунт, '}
          <span className={styles.linkText} onClick={toggleAuthMode}>
            {isLogin ? 'регистрацию' : 'войдите'}
          </span>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
