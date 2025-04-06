import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import styles from "./TasksPage.module.css";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";

type Task = {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
};

const TasksPage: React.FC = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks", {
          credentials: "include"
        });
        const data = await response.json();
        setTasks(data);
        setInitialTasks(data); 
      } catch (error) {
        console.error("Ошибка при загрузке задач:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const [initialTasks, setInitialTasks] = useState<Task[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const updated = [...tasks];
    const [moved] = updated.splice(source.index, 1);
    updated.splice(destination.index, 0, moved);
    setTasks(updated);

    // Сравниваем текущий и начальный порядок
    const changed = updated.some((task, i) => task.id !== initialTasks[i]?.id);
    setHasChanges(changed);
  };

  const toggleTaskCompletion = async (id: string) => {
    const taskToUpdate = tasks.find((t) => t.id === id);
    if (!taskToUpdate) return;
  
    const updatedTask = {
      ...taskToUpdate,
      is_completed: !taskToUpdate.is_completed,
    };
  
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: updatedTask.title,
          description: updatedTask.description,
          priority: 0,
          is_completed: updatedTask.is_completed,
        }),
      });
  
      if (!response.ok) throw new Error("Ошибка при обновлении статуса");
  
      const data = await response.json();
  
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? data : task))
      );
    } catch (error) {
      console.error(error);
    }
  };  

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      if (!response.ok) throw new Error("Ошибка при удалении задачи");
  
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;

    try {
      const response = await fetch(`/api/tasks`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: 0,
        }),
      });

      if (!response.ok) throw new Error("Ошибка при создании задачи");

      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
  
    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          priority: 0, // по желанию можно сохранить приоритет
          is_completed: editingTask.is_completed,
        }),
      });
  
      if (!response.ok) throw new Error("Ошибка при обновлении задачи");
  
      const updatedTask = await response.json();
  
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id ? updatedTask : task
        )
      );
      setEditingTask(null);
    } catch (error) {
      console.error(error);
    }
  };  

  const handleEditClose = () => {
    setEditingTask(null);
  };

  const handleSaveOrder = async () => {
    try {
      // Выполняем последовательный PUT для каждой задачи
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
  
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            is_completed: task.is_completed,
            priority: i, // Новый приоритет — это индекс в массиве
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Ошибка при обновлении задачи ID ${task.id}`);
        }
      }
  
      // После успешного обновления всех задач:
      setInitialTasks([...tasks]);
      setHasChanges(false);
      console.log("Порядок успешно сохранён");
    } catch (error) {
      console.error("Ошибка сохранения порядка:", error);
    }
  };  

  return (
    <div>
      <Header />
      <div className={styles.pageTasksList}>
        <h2>Список задач</h2>
        <span>Чем выше задача, тем выше приоритет</span>

        <button onClick={() => setModalOpen(true)} className={styles.btn__add}>
          Добавить задачу
        </button>

        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Новая задача</h3>
              <input
                type="text"
                placeholder="Название"
                value={newTitle}
                className={styles.input}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                placeholder="Описание"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className={styles.textarea}
              />
              <div className={styles.modalButtons}>
                <button
                  onClick={() => setModalOpen(false)}
                  className={styles.btn__add}
                  style={{ width: 150, backgroundColor: "red" }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddTask}
                  className={styles.btn__add}
                  style={{ width: 150 }}
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        )}

        {editingTask && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Редактировать задачу</h3>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={styles.input}
                placeholder="Название"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={styles.textarea}
                placeholder="Описание"
              />
              <div className={styles.modalButtons}>
                <button
                  onClick={handleEditClose}
                  className={styles.btn__add}
                  style={{ width: 150, backgroundColor: "red" }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleUpdateTask}
                  className={styles.btn__add}
                  style={{ width: 150 }}
                >
                  Сохранить
                </button>
              </div>

              <button
                onClick={() => navigate(`/pomodoro/${editingTask.id}`)}
                className={styles.btn__add}
                style={{ width: "310px", backgroundColor: "#007acc" }}
              >
                Таймер помидоро
              </button>
            </div>
          </div>
        )}

        {hasChanges && (
          <button
            onClick={handleSaveOrder}
            className={styles.btn__add}
            style={{ margin: "10px 0", backgroundColor: "#4caf50", color: "#fff" }}
          >
            Сохранить изменения
          </button>
        )}

        {!isLoading && tasks.length === 0 ? (
          <p style={{ padding: "20px", fontStyle: "italic", color: "#666" }}>
            Задач нет
          </p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="taskList">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={styles.tasksList}
                >
                  {tasks.map((task, index) => (
                    <Draggable
                      key={String(task.id)}
                      draggableId={String(task.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => handleEditClick(task)}
                          style={{
                            backgroundColor: snapshot.isDragging
                              ? "#e0f7fa"
                              : "#fafafa",
                            ...provided.draggableProps.style,
                          }}
                          className={styles.taskList__item}
                        >
                          <div
                            style={{ position: "relative", paddingRight: 30 }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              style={{
                                position: "absolute",
                                top: -10,
                                right: 0,
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#888",
                                width: "max-content",
                                fontSize: 30,
                              }}
                            >
                              ×
                            </button>
                            <input
                              type="checkbox"
                              checked={task.is_completed}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleTaskCompletion(task.id)}
                              style={{
                                position: "absolute",
                                top: 2,
                                right: 20,
                                zIndex: 1,
                                width: "max-content",
                              }}
                            />
                            <div>
                              <strong
                                style={{
                                  textDecoration: task.is_completed
                                    ? "line-through"
                                    : "none",
                                  display: "block",
                                  paddingRight: 20,
                                }}
                              >
                                {task.title}
                              </strong>
                              <p
                                style={{
                                  margin: "4px 0 0 0",
                                  color: "#555",
                                  display: "block",
                                  paddingRight: 20,
                                }}
                              >
                                {task.description}
                              </p>
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
