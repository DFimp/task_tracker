import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ResetPasswordPage.module.css";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Токен не найден");
      return;
    }

    try {
      const response = await fetch(
        `/api/user/confirm_reset_password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            new_password: newPassword,
          }),
        }
      );

      if (response.ok) {
        setSuccess("Пароль успешно обновлён");
        setTimeout(() => navigate("/auth"), 2000);
      } else {
        const data = await response.json();
        setError(data?.message || "Ошибка при сбросе пароля");
      }
    } catch (err) {
      setError("Ошибка сети");
    }
  };

  return (
    <div className={styles.resetPage}>
      <h2>Сброс пароля</h2>
      <form onSubmit={handleSubmit} className={styles.resetForm}>
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <span className={styles.eyeIcon} onClick={togglePasswordVisibility}>
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>
        <button type="submit" className={styles.form__button}>
          Сменить пароль
        </button>
      </form>
      {success && <p className={styles.successMessage}>{success}</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default ResetPasswordPage;
