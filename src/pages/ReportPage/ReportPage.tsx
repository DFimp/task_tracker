import React, { useEffect, useState } from "react";
import styles from "./ReportPage.module.css";
import Header from "../../components/Header/Header";

type Task = {
  id: number;
  title: string;
  description: string;
  priority: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

type PomodoroStat = {
  taskId: number;
  taskTitle: string;
  description: string;
  creationDate: string;
  timeSpentMinutes: number;
};

type CombinedTask = Task & {
  timeSpentMinutes?: number;
};

const ReportPage: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<CombinedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<CombinedTask[]>([]);
  const [filter, setFilter] = useState<"day" | "week" | "month" | "all">("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Получаем пользователя
        const userRes = await fetch("/api/user/get_current", {
          credentials: "include",
        });
        const user = await userRes.json();
        setUserId(user.id);

        // Загружаем задачи
        const tasksRes = await fetch("/api/tasks", {
          credentials: "include",
        });
        const tasksData: Task[] = await tasksRes.json();

        // Загружаем статистику
        const statsRes = await fetch(
          `http://212.41.30.156:7000/pomodoro/get-pomodoro-stats?userId=${user.id}`
        );
        const statsData: PomodoroStat[] = await statsRes.json();

        // Объединяем по taskId
        const merged = tasksData.map((task) => {
          const stat = statsData.find((s) => s.taskId === task.id);
          return {
            ...task,
            timeSpentMinutes: stat?.timeSpentMinutes ?? 0,
          };
        });

        setTasks(merged);
        setFilteredTasks(merged);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    loadData();
  }, []);

  const filterTasks = (mode: "day" | "week" | "month" | "all") => {
    setFilter(mode);
    const now = new Date();
    let fromDate = new Date(now);

    if (mode === "day") fromDate.setDate(now.getDate() - 1);
    else if (mode === "week") fromDate.setDate(now.getDate() - 7);
    else if (mode === "month") fromDate.setMonth(now.getMonth() - 1);
    else {
      setFilteredTasks(tasks);
      return;
    }

    const result = tasks.filter(
      (task) => new Date(task.created_at) >= fromDate
    );
    setFilteredTasks(result);
  };

  const completedCount = filteredTasks.filter((t) => t.is_completed).length;
  const notCompletedCount = filteredTasks.length - completedCount;

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <h2>Статистика задач</h2>
        <div className={styles.stats}>
          <p>Всего задач: {filteredTasks.length}</p>
          <p>Завершено: {completedCount}</p>
          <p>Не завершено: {notCompletedCount}</p>
        </div>

        <div className={styles.filterButtons}>
          <button
            className={filter === "day" ? styles.active : ""}
            onClick={() => filterTasks("day")}
          >
            За день
          </button>
          <button
            className={filter === "week" ? styles.active : ""}
            onClick={() => filterTasks("week")}
          >
            За неделю
          </button>
          <button
            className={filter === "month" ? styles.active : ""}
            onClick={() => filterTasks("month")}
          >
            За месяц
          </button>
          <button
            className={filter === "all" ? styles.active : ""}
            onClick={() => filterTasks("all")}
          >
            Все
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название задачи</th>
                <th>Выполнена</th>
                <th>Дата создания</th>
                <th>Затраченное время (мин)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.is_completed ? "Да" : "Нет"}</td>
                  <td>{new Date(task.created_at).toLocaleString()}</td>
                  <td>{task.timeSpentMinutes?.toFixed(2) ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
