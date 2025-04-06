import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import styles from "./PomodoroPage.module.css";

type Task = {
  id: number;
  title: string;
  description: string;
  priority: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

const PomodoroPage: React.FC = () => {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [workMinutes, setWorkMinutes] = useState(25);
  const [chillMinutes, setChillMinutes] = useState(5);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [sessionFinished, setSessionFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Получение задачи
  useEffect(() => {
    const fetchTask = async () => {
      const res = await fetch(`/api/tasks/${id}`, { credentials: "include" });
      const data = await res.json();
      setTask(data);
      setIsLoading(false);
    };
    fetchTask();
  }, [id]);

  // Получение пользователя
  useEffect(() => {
    const fetchUserAndPomodoro = async () => {
      try {
        const res = await fetch("/api/user/get_current", {
          credentials: "include",
        });
        const user = await res.json();
        setUserId(user.id);
  
        // Получить активный помидоро, если есть
        const pomoRes = await fetch(
          `http://212.41.30.156:7000/pomodoro/get-started-pomodoro?userId=${user.id}`,
        );
        if (pomoRes.ok) {
          const pomoData = await pomoRes.json();
          if (String(pomoData.taskId) === id) {
            const totalSecondsLeft =
              Math.floor(pomoData.nextPhaseInMinutes * 60) - pomoData.elapsedTime;
            setSecondsLeft(totalSecondsLeft > 0 ? totalSecondsLeft : 0);
            setIsWorkTime(pomoData.currentPhase === "work");
            setIsRunning(true);
            setSessionFinished(false);
          }
        }
      } catch (error) {
        console.error("Ошибка при получении пользователя или помидоро:", error);
      }
    };
  
    fetchUserAndPomodoro();
  }, [id]);

  // Таймер
  useEffect(() => {
    if (!isRunning || sessionFinished) return;

    if (secondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else {
      if (isWorkTime) {
        // Переход к отдыху
        setIsWorkTime(false);
        setSecondsLeft(chillMinutes * 60);
      } else {
        // Завершение сессии
        setIsRunning(false);
        setSessionFinished(true);
        stopPomodoro();
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, secondsLeft, isWorkTime, sessionFinished]);

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (totalSeconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const startPomodoro = async () => {
    if (!userId || !task) return;
    try {
      await fetch(
        `http://212.41.30.156:7000/pomodoro/start?userId=${userId}&taskId=${task.id}&workMinutes=${workMinutes}&chillMinutes=${chillMinutes}`,
        { method: "POST" }
      );
      setSecondsLeft(workMinutes * 60);
      setIsRunning(true);
      setIsWorkTime(true);
      setSessionFinished(false);
    } catch (e) {
      console.error("Ошибка при старте помидоро", e);
    }
  };

  const stopPomodoro = async () => {
    if (!userId || !task) return;
    try {
      await fetch(
        `http://212.41.30.156:7000/pomodoro/stop?userId=${userId}&taskId=${task.id}`,
        { method: "POST" }
      );
    } catch (e) {
      console.error("Ошибка при остановке помидоро", e);
    }
  };

  const handleStopClick = async () => {
    await stopPomodoro();
    setIsRunning(false);
    setSessionFinished(true);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning) {
        e.preventDefault();
        e.returnValue = ""; // для некоторых браузеров
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isRunning]);
  

  return (
    <>
      <Header locked={isRunning} />
      <div className={styles.wrapper}>
        <div className={styles.form}>
          <h2 className={styles.title}>Задача: {task?.title}</h2>
          <p className={styles.status}>
            Состояние:{" "}
            <strong>
              {sessionFinished
                ? "Завершено"
                : isRunning
                ? isWorkTime
                  ? "Работа"
                  : "Отдых"
                : "Ожидание"}
            </strong>
          </p>

          <div className={styles.timer}>{formatTime(secondsLeft)}</div>

          {!isRunning && !sessionFinished && (
            <div className={styles.inputGroup}>
              <label>
                Работа (мин):
                <input
                  style={{ maxWidth: 220, width: "auto" }}
                  type="number"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(Number(e.target.value))}
                />
              </label>
              <label>
                Отдых (мин):
                <input
                  style={{ maxWidth: 220, width: "auto" }}
                  type="number"
                  value={chillMinutes}
                  onChange={(e) => setChillMinutes(Number(e.target.value))}
                />
              </label>
            </div>
          )}

          {!isRunning && !sessionFinished && (
            <button onClick={startPomodoro} className={styles.button}>
              Старт
            </button>
          )}

          {isRunning && (
            <button onClick={handleStopClick} className={styles.button}>
              Стоп
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default PomodoroPage;
