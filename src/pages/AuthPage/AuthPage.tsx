import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./AuthPage.module.css";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const AuthPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const validatePassword = (pwd: string): boolean => {
    const hasMinLength = pwd.length >= 6;
    const uppercaseCount = (pwd.match(/[A-Z]/g) || []).length;
    const hasSpecialChar = /[!@#$%^&*()]/.test(pwd);
    return hasMinLength && uppercaseCount >= 2 && hasSpecialChar;
  };

  const handleLogin = async () => {
    if (!email || !password) return;

    if (isLogin) {
      // Логин
      try {
        const response = await fetch(`${BASE_URL}/api/user/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Ошибка входа. Проверьте данные.");
        }

        const data = await response.json();
        console.log("Успешный вход:", data);

        login(); // Обновляем контекст
        navigate("/tasks");
      } catch (error) {
        console.error(error);
        alert("Не удалось войти. Проверьте email и пароль.");
      }
    } else {
      // Регистрация
      if (!validatePassword(password)) {
        setPasswordError(
          "Пароль должен быть не менее 6 символов, содержать хотя бы две заглавные буквы и один специальный символ(!@#$%^&*())."
        );
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/user/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            "Ошибка регистрации. Возможно, email уже зарегистрирован."
          );
        }

        const data = await response.json();
        console.log("Успешная регистрация:", data);

        login(); // Сразу логиним пользователя
        navigate("/tasks");
      } catch (error) {
        console.error(error);
        alert("Ошибка регистрации. Повторите позже.");
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setPasswordError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Введите email для восстановления пароля");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/user/reset_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при попытке восстановления пароля.");
      }

      setIsResetPassword(true);
      setResetMessage("Инструкция по восстановлению отправлена на ваш email.");
    } catch (error) {
      console.error(error);
      setResetMessage("Ошибка при восстановлении. Попробуйте позже.");
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authPage__wrapperForm}>
        <h2 className={styles.form__title}>
          {isLogin ? "Вход" : "Регистрация"}
        </h2>

        <form className={styles.authPage__form}>
          <span className={styles.form__text}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className={styles.form__text}>Пароль</span>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className={styles.eyeIcon} onClick={togglePasswordVisibility}>
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {passwordError && <p className={styles.errorText}>{passwordError}</p>}

          {isLogin && !isResetPassword && (
            <span className={styles.linkText} onClick={handleResetPassword}>
              Восстановить пароль
            </span>
          )}

          {resetMessage && <p className={styles.successText}>{resetMessage}</p>}
        </form>

        <button className={styles.form__button} onClick={handleLogin}>
          {isLogin ? "Войти" : "Зарегистрироваться"}
        </button>

        <div className={styles.wrapperForm__text}>
          {isLogin
            ? "Если у вас нет аккаунта, пройдите "
            : "Если у вас уже есть аккаунт, "}
          <span className={styles.linkText} onClick={toggleAuthMode}>
            {isLogin ? "регистрацию" : "войдите"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
