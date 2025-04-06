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

const ReportPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"day" | "week" | "month" | "all">("all");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks", {
          credentials: "include",
        });
        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data);
      } catch (error) {
        console.error("Ошибка при загрузке задач:", error);
      }
    };

    fetchTasks();
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

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название задачи</th>
              <th>Выполнена</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.is_completed ? "Да" : "Нет"}</td>
                <td>{new Date(task.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportPage;
